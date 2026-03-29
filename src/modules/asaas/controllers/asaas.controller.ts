import { Request, Response } from "express";
import { ZodError } from "zod";

import { AsaasService } from "../services/asaas.service";
import { criarClienteSchema, idParamSchema, pagamentoUnionSchema, paymentIdParamSchema } from "../schemas/asaas.schema";

export class AsaasController {
  constructor(private readonly service = new AsaasService()) {}

  private getClientIp(req: any): string | undefined {
    const xf = req.headers["x-forwarded-for"];
    if (Array.isArray(xf)) return xf[0];
    if (typeof xf === "string") return xf.split(",")[0]?.trim();
    return req.ip;
  }

  async criarCliente(req: Request, res: Response) {
    try {
      const data = criarClienteSchema.parse(req.body);
      const result = await this.service.criarCliente(data);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res, "Erro ao criar cliente no Asaas", 502);
    }
  }

  async criarPagamento(req: Request, res: Response) {
    try {
      if (typeof req.body?.valor === "string") {
        const n = Number(req.body.valor);
        if (!Number.isFinite(n)) {
          res.status(400).json({ error: "Campo 'valor' invalido" });
          return;
        }
        req.body.valor = n;
      }
      const data = pagamentoUnionSchema.parse(req.body);
      const result = await this.service.criarPagamento(data, this.getClientIp(req));
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res, "Erro ao criar pagamento no Asaas", 502);
    }
  }

  async obterQrCodePix(req: Request, res: Response) {
    try {
      const { paymentId } = paymentIdParamSchema.parse(req.params);
      const result = await this.service.obterQrCodePix(paymentId);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res, "Erro ao obter QR Code Pix no Asaas", 502);
    }
  }

  async obterStatusPagamento(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await this.service.obterStatusPagamento(id);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res, "ASAAS_STATUS_ERROR", 400);
    }
  }

  async obterBoletoPdf(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const pdf = await this.service.obterBoletoPdf(id);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="boleto-${id}.pdf"`,
      });
      res.send(pdf);
    } catch (error) {
      this.handleError(error, res, "Erro ao obter PDF", 400);
    }
  }

  async webhookAsaas(req: Request, res: Response) {
    try {
      const token = req.get("asaas-access-token");
      if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
        res.status(401).send("Token invalido");
        return;
      }
      await this.service.processarWebhook(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Erro no webhook Asaas:", error);
      res.sendStatus(500);
    }
  }

  private handleError(error: unknown, res: Response, fallbackMessage: string, status = 500) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Validacao falhou", issues: error.flatten() });
      return;
    }
    if (error instanceof Error && (error.message.includes("nao encontrado") || error.message.includes("Informe"))) {
      res.status(400).json({ error: error.message });
      return;
    }
    const details = error instanceof Error ? error.message : error;
    res.status(status).json({ error: fallbackMessage, details });
  }
}
