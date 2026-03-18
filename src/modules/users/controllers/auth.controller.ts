import { Request, Response } from "express";
import { ZodError } from "zod";

import { AuthModel } from "../models/auth.model";
import { loginSchema, resetPasswordSchema } from "../schemas/auth.schema";

export class AuthController {
    private loginModel: AuthModel;

    constructor() {
        this.loginModel = new AuthModel();
    }

    async login(req: Request, res: Response) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this.loginModel.login(data.email, data.senha);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao realizar login', detalhe: String(error) });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this.loginModel.forgotPassword(data.email);
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
            const result = await this.loginModel.resetPassword(data.token, data.novaSenha);
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