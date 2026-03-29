import { Request, Response } from "express";
import { z } from "zod";

import { CheckinService } from "../services/checkin.service";

const checkinSchema = z.object({
  ingressoId: z.string().uuid().optional(),
  qrCode: z.string().min(1).optional(),
  local: z.string().min(1).optional(),
  feitoPor: z.string().min(1).optional(),
});

export class CheckinController {
  constructor(private readonly service = new CheckinService()) {}

  async checkin(req: Request, res: Response) {
    const parsed = checkinSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "INVALIDO", mensagem: "Dados invalidos para check-in." });
      return;
    }

    const { ingressoId, qrCode, local, feitoPor } = parsed.data;
    if (!ingressoId && !qrCode) {
      res.status(400).json({ status: "INVALIDO", mensagem: "E necessario informar ingressoId ou qrCode." });
      return;
    }

    try {
      const result = await this.service.checkin(ingressoId, qrCode, local, feitoPor);
      res.status(200).json(result);
    } catch (error) {
      console.error("[CHECKIN_INGRESSO] Erro ao realizar check-in:", error);
      res.status(500).json({ status: "INVALIDO", mensagem: "Erro interno ao processar o check-in." });
    }
  }
}
