import { AuthRepository } from "../repositories/auth.repository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
    constructor(private readonly repository = new AuthRepository()) { }

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

        return this.repository.forgotPassword(email);
    }

}