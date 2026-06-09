import { ZodError } from "zod";

import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../schemas/auth.schema";
import { AuthService } from "../services/auth.service";

import { Request, Response } from "express";

export class AuthController {
    constructor(private readonly service = new AuthService()) { }

    async login(req: Request, res: Response) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this.service.login(data.email, data.senha);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            const detalhe = error instanceof Error ? error.message : String(error);
            const status = detalhe === "Login ou senha incorretos"
                ? 401
                : detalhe === "Conta removida"
                    ? 403
                    : 500;
            console.error(error);
            res.status(status).json({ error: 'Erro ao realizar login', detalhe });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const data = forgotPasswordSchema.parse(req.body);
            const result = await this.service.forgotPassword(data.email);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao solicitar recuperação de senha', detalhe: String(error) });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const data = resetPasswordSchema.parse(req.body);
            const result = await this.service.resetPassword(data.token, data.novaSenha);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao redefinir senha', detalhe: String(error) });
        }
    }
}