import { Request, Response } from "express";

import { LgpdService } from "../services/lgpd.service";

export class LgpdController {
  constructor(private readonly service = new LgpdService()) {}

  async deletarMinhaConta(req: Request, res: Response) {
    const torcedorId = req.userLogadoId;

    if (!torcedorId) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const result = await this.service.anonimizarTorcedor(torcedorId, "TITULAR");
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Torcedor não encontrado") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Torcedor já anonimizado") {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      console.error(error);
      res.status(500).json({ error: "Erro ao remover dados", detalhe: String(error) });
    }
  }

  async anonimizarTorcedorAdmin(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const result = await this.service.anonimizarTorcedor(id, "ADMIN");
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Torcedor não encontrado") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Torcedor já anonimizado") {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      console.error(error);
      res.status(500).json({ error: "Erro ao anonimizar torcedor", detalhe: String(error) });
    }
  }
}
