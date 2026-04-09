import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { redefinicaoSenhaTemplate } from "../../emails/email-templates/redefinicao-senha.template";
import { sendEmail } from "../../emails/services/email.service";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
    constructor(private readonly repository = new AuthRepository()) { }

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
        const user = await this.repository.findUserByEmail(email);

        if (!user) {
            throw new Error(mensagemPadrao);
        }

        const senhaConfere = await bcrypt.compare(senha, user.senha);
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