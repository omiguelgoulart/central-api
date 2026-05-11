import { Request, Response } from "express";
import { ZodError } from "zod";

import { faturaSchema } from "../schemas/pagamento.schema";
import { FaturaService } from "../services/fatura.service";

export class FaturaController {
    constructor(private readonly service = new FaturaService()) { }

    async createFatura(req: Request, res: Response) {
        try {
            const data = faturaSchema.parse(req.body);
            const result = await this.service.createFatura(data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao criar fatura");
        }
    }

    async getAllFaturas(res: Response) {
        try {
            const result = await this.service.getAllFaturas();
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar faturas");
        }
    }

    async getFaturaById(req: Request, res: Response) {
        try {
            const result = await this.service.getFaturaById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar fatura");
        }
    }

    async deleteFatura(req: Request, res: Response) {
        try {
            const result = await this.service.deleteFatura(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao deletar fatura");
        }
    }

    async updateFatura(req: Request, res: Response) {
        try {
            const data = faturaSchema.partial().parse(req.body);
            const result = await this.service.updateFatura(req.params.id, data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao atualizar fatura");
        }
    }

    async pagarMultiplo(req: Request, res: Response) {
        try {
            const { faturaIds, metodo } = req.body as { faturaIds?: string[]; metodo?: string };
            if (!Array.isArray(faturaIds) || faturaIds.length === 0) {
                res.status(400).json({ error: "faturaIds deve ser um array não vazio" });
                return;
            }
            if (metodo !== "PIX" && metodo !== "BOLETO") {
                res.status(400).json({ error: "metodo deve ser PIX ou BOLETO" });
                return;
            }
            const result = await this.service.pagarMultiplo(faturaIds, metodo);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao processar pagamento das faturas");
        }
    }

    async gerarBoleto(req: Request, res: Response) {
        try {
            const result = await this.service.gerarBoleto(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao gerar boleto");
        }
    }

    private handleError(error: unknown, res: Response, fallbackMessage: string) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        if (error instanceof Error && error.message.includes("nao encontrada")) {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error instanceof Error && error.message.includes("nao encontrado")) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error(error);
        res.status(500).json({ error: fallbackMessage });
    }
}
