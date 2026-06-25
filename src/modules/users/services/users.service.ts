import crypto from "crypto";
import bcrypt from "bcrypt";

import { boasVindasTemplate } from "../../emails/email-templates/boas-vindas.template";
import { verificacaoEmailTemplate } from "../../emails/email-templates/verificacao-email.template";
import { sendEmail } from "../../emails/services/email.service";
import { gerarMatricula } from "../../../utils/matricula";
import { UserRepository } from "../repositories/users.repository";
import { CreateUsuarioInput, UpdateUsuarioInput } from "../types/users.type";

export class UserService {
    constructor(private readonly repository = new UserRepository()) { }

    private getEmailVerificationBaseUrl(): string {
        if (process.env.EMAIL_VERIFICATION_URL) {
            return process.env.EMAIL_VERIFICATION_URL.replace(/\/$/, "");
        }

        const frontendUrl = process.env.FRONTEND_URL
            ?.split(",")
            .map((origin) => origin.trim())
            .find(Boolean);

        if (frontendUrl) {
            return `${frontendUrl.replace(/\/$/, "")}/verificar-email`;
        }

        return "http://localhost:3000/verificar-email";
    }

    private async enviarEmailVerificacao(nome: string, email: string, token: string) {
        const baseUrl = this.getEmailVerificationBaseUrl();
        const separador = baseUrl.includes("?") ? "&" : "?";
        const linkVerificacao = `${baseUrl}${separador}token=${encodeURIComponent(token)}`;

        const html = verificacaoEmailTemplate({
            nome,
            linkVerificacao,
        });

        await sendEmail({
            to: email,
            subject: "Confirme seu e-mail",
            html,
        });
    }

    private async enviarEmailBoasVindas(nome: string, matricula: string, email: string) {
        const html = boasVindasTemplate({
            nome,
            matricula,
        });

        await sendEmail({
            to: email,
            subject: "Bem-vindo(a) a Central de Torcedores!",
            html,
        });
    }

    private async gerarMatriculaUnica() {
        const MAX_TENTATIVAS = 10;

        for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
            const matricula = gerarMatricula();
            const matriculaExistente = await this.repository.getUserByMatricula(matricula);

            if (!matriculaExistente) {
                return matricula;
            }
        }

        throw new Error('Não foi possível gerar uma matrícula única');
    }

    async createUser(data: CreateUsuarioInput) {
        const emailExistente = await this.repository.getUserByEmail(data.email);
        if (emailExistente) {
            throw new Error('Já existe um usuário com esse email');
        }

        const senhaHash = await bcrypt.hash(data.senha, 10);

        const matricula = await this.gerarMatriculaUnica();
        const newUser = await this.repository.createUser({
            ...data,
            senha: senhaHash,
            matricula,
        });

        const emailToken = crypto.randomUUID();
        const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.repository.updateEmailToken(newUser.id, emailToken, emailTokenExpiry);

        this.enviarEmailVerificacao(newUser.nome, newUser.email, emailToken)
            .catch((err) => console.error("Erro ao enviar email de verificacao:", err));

        return {
            message: 'Usuário criado com sucesso',
            userId: newUser.id
        };
    }

    async getAllUsers() {
        return this.repository.getAllUsers();
    }

    async getUserByToken(id: string) {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const ingressos = (user.pedidos ?? [])
            .flatMap((pedido) =>
                (pedido.itens ?? [])
                    .map((item) => {
                        if (!item.ingresso) return null;

                        return {
                            id: item.ingresso.id,
                            torcedorId: pedido.torcedorId,
                            jogoId: item.lote?.jogoId ?? "",
                            loteId: item.loteId ?? null,
                            qrCode: item.ingresso.qrCode,
                            valor: String(item.valorUnitario ?? 0),
                            status: item.ingresso.status,
                            criadoEm: item.ingresso.criadoEm,
                            usadoEm: item.ingresso.usadoEm,
                            atualizadoEm: item.ingresso.atualizadoEm,
                            pagamentoId: pedido.pagamento?.externalId ?? null,
                            jogo: item.lote?.jogo ?? null,
                            lote: item.lote ?? null,
                        };
                    })
                    .filter(Boolean)
            );

        return {
            ...user,
            ingressos,
        };
    }

    async getUserById(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return user;
    }

    async getUserByCpf(cpf: string) {
        const cpfLimpo = cpf.replace(/\D/g, "");
        if (cpfLimpo.length !== 11) {
            throw new Error('CPF inválido');
        }

        const user = await this.repository.getUserByCpf(cpfLimpo);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return user;
    }

    async deleteUser(id: string) {
        const userExistente = await this.repository.getUserById(id);
        if (!userExistente) {
            throw new Error('Usuário não encontrado');
        }
        await this.repository.deleteUser(id);

        return {
            message: 'Usuário deletado com sucesso'
        };
    }

    async updateUser(id: string, data: UpdateUsuarioInput) {
        const userExistente = await this.repository.getUserById(id);
        if (!userExistente) {
            throw new Error('Usuário não encontrado');
        }
        if (data.email) {
            const emailExistente = await this.repository.getUserByEmail(data.email);
            if (emailExistente && emailExistente.id !== id) {
                throw new Error('Já existe um usuário com esse email');
            }
        }
        if (data.matricula) {
            const matriculaExistente = await this.repository.getUserByMatricula(String(data.matricula));
            if (matriculaExistente && matriculaExistente.id !== id) {
                throw new Error('Já existe um usuário com essa matrícula');
            }
        }

        const updateData: UpdateUsuarioInput = { ...data };
        if (data.senha) {
            updateData.senha = await bcrypt.hash(data.senha, 10);
        }

        return this.repository.updateUser(id, updateData);
    }

    async countUsers() {
        return this.repository.countUsers();
    }

    async getUserWithDetails(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const model = this.repository as unknown as {
            getUserPlans?: (userId: string) => Promise<unknown[]>;
            getUserGames?: (userId: string) => Promise<unknown[]>;
        };

        const [planos, jogos] = await Promise.all([
            model.getUserPlans?.(id) ?? Promise.resolve<unknown[]>([]),
            model.getUserGames?.(id) ?? Promise.resolve<unknown[]>([]),
        ]);

        return {
            ...user,
            planos,
            jogos,
        };
    }

    async getUserByEmailToken(emailToken: string) {
        return this.repository.getUserByEmailToken(emailToken);
    }

    async verifyEmailToken(token: string) {
        const user = await this.repository.getUserByEmailToken(token);
        if (!user) {
            throw new Error('Token de email inválido');
        }
        await this.repository.markEmailAsVerified(user.id);

        if (user.email && user.nome && user.matricula) {
            this.enviarEmailBoasVindas(user.nome, user.matricula, user.email)
                .catch((err) => console.error("Erro ao enviar email de boas-vindas:", err));
        }

        return { message: 'Email verificado com sucesso' };
    }

    async verifyEmail(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        await this.repository.markEmailAsVerified(id);

        if (user.email && user.nome && user.matricula) {
            this.enviarEmailBoasVindas(user.nome, user.matricula, user.email)
                .catch((err) => console.error("Erro ao enviar email de boas-vindas:", err));
        }

        return { message: 'Email verificado com sucesso' };
    }

    async updateEmailToken(id: string, emailToken: string, emailTokenExpiry: Date) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.repository.updateEmailToken(id, emailToken, emailTokenExpiry);
    }

    async updatePhotoUrl(id: string, photoUrl: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.repository.updatePhotoUrl(id, photoUrl);
    }

    async markEmailAsVerified(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.repository.markEmailAsVerified(id);
    }

}


