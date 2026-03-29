import { Request, Response } from "express";

import { AdminLoginService } from "../services/adminLogin.service";

export class AdminLoginController {
  constructor(private readonly service = new AdminLoginService()) {}

  async login(req: Request, res: Response) {
    const { email, senha } = req.body as { email?: string; senha?: string };
    const mensagemPadrao = "Login ou senha incorretos";

    if (!email || !senha) {
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    try {
      const result = await this.service.login(email, senha);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === mensagemPadrao) {
        res.status(400).json({ erro: mensagemPadrao });
        return;
      }
      console.error("Erro no login admin:", error);
      res.status(500).json({ error: "Erro interno no servidor ao fazer login de admin" });
    }
  }
}
