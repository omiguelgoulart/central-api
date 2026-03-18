import { AuthModel } from "../models/auth.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
    private loginModel: AuthModel;

    constructor() {
        this.loginModel = new AuthModel();
    }

    async login(email: string, senha: string) {
        const mensagemPadrao = "Login ou senha incorretos";
        const user = await this.loginModel.findUserByEmail(email);

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
        const user = await this.loginModel.findUserByEmail(email);
        if (!user) {
            throw new Error("Email não encontrado");
        }

        return this.loginModel.recoverPassword(email);

        
    }

    async resetPassword(token: string, novaSenha: string) {
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        return this.loginModel.resetPassword(token, senhaHash);
    }

}