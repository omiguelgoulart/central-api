import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { redefinicaoSenhaTemplate } from "../../emails/email-templates/redefinicao-senha.template";
import { sendEmail } from "../../emails/services/email.service";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
    constructor(private readonly repository = new AuthRepository()) { }

    private isBcryptHash(value: string): boolean {
        return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
    }

    private async comparaSenhaComHash(candidata: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(candidata, hash);
        } catch {
            return false;
        }
    }

    private getPasswordResetBaseUrl(): string {
        if (process.env.PASSWORD_RESET_URL) {
            return process.env.PASSWORD_RESET_URL.replace(/\/$/, "");
        }

        const frontendUrl = process.env.FRONTEND_URL
            ?.split(",")
            .map((origin) => origin.trim())
            .find(Boolean);

        if (frontendUrl) {
            return `${frontendUrl.replace(/\/$/, "")}/novaSenha`;
        }

        return "http://localhost:3000/novaSenha";
    }

    async login(email: string, senha: string) {
        const mensagemPadrao = "Login ou senha incorretos";
        const emailNormalizado = email.trim();
        const senhaNormalizada = senha;
        const senhaSemEspacos = senha.trim();

        const user = await this.repository.findUserByEmail(emailNormalizado);

        if (!user) {
            throw new Error(mensagemPadrao);
        }

        let senhaConfere = false;
        const senhaBanco = user.senha ?? "";
        const senhaBancoSemEspacos = senhaBanco.trim();

        if (this.isBcryptHash(senhaBanco)) {
            senhaConfere = await this.comparaSenhaComHash(senhaNormalizada, senhaBanco);

            if (!senhaConfere && senhaSemEspacos !== senhaNormalizada) {
                senhaConfere = await this.comparaSenhaComHash(senhaSemEspacos, senhaBanco);
            }
        } else {
            senhaConfere =
                senhaNormalizada === senhaBanco ||
                senhaSemEspacos === senhaBanco ||
                senhaNormalizada === senhaBancoSemEspacos ||
                senhaSemEspacos === senhaBancoSemEspacos;

            if (senhaConfere) {
                const senhaParaHash =
                    senhaNormalizada === senhaBanco || senhaNormalizada === senhaBancoSemEspacos
                        ? senhaNormalizada
                        : senhaSemEspacos;
                const senhaHash = await bcrypt.hash(senhaParaHash, 10);
                try {
                    await this.repository.updatePasswordById(user.id, senhaHash);
                } catch (error) {
                    console.error("Erro ao migrar senha legada para hash:", error);
                }
            }
        }

        if (!senhaConfere) {
            throw new Error(mensagemPadrao);
        }

        const token = jwt.sign(
            {
                userLogadoId: user.id,
                userLogadoNome: user.nome,
            },
            process.env.JWT_KEY as string,
            { expiresIn: "1h" }
        );
        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            token,
        };
    }

    async recoverPassword(email: string) {
        const user = await this.repository.findUserByEmail(email);
        if (!user) {
            throw new Error("Email não encontrado");
        }

        return this.repository.recoverPassword(email);
    }

    async resetPassword(token: string, novaSenha: string) {
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        return this.repository.resetPassword(token, senhaHash);
    }

    async forgotPassword(email: string) {
        const user = await this.repository.findUserByEmail(email);
        if (!user) {
            throw new Error("Email não encontrado");
        }

        const recovery = await this.repository.forgotPassword(email);
        if (!recovery?.senhaToken) {
            throw new Error("Não foi possível gerar token de recuperação");
        }

        const html = redefinicaoSenhaTemplate({
            nome: user.nome,
            token: recovery.senhaToken,
            linkBase: this.getPasswordResetBaseUrl(),
        });

        await sendEmail({
            to: user.email,
            subject: "Redefinição de senha",
            html,
        });

        return {
            message: "E-mail de redefinição enviado com sucesso",
        };
    }

}