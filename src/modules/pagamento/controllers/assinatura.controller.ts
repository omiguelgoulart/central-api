import { Request, Response } from "express";
import { ZodError } from "zod";

import { assinaturaSchema } from "../schemas/pagamento.schema";
import { AssinaturaService } from "../services/assinatura.service";

export class AssinaturaController {
    constructor(private readonly service = new AssinaturaService()) { }

    async createAssinatura(req: Request, res: Response) {
        try {
            const data = assinaturaSchema.parse(req.body);
            const result = await this.service.createAssinatura(data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao criar assinatura");
        }
    }

    async getAllAssinaturas(res: Response) {
        try {
            const result = await this.service.getAllAssinaturas();
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar assinaturas");
        }
    }

    async getAssinaturaById(req: Request, res: Response) {
        try {
            const result = await this.service.getAssinaturaById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar assinatura");
        }
    }

    async deleteAssinatura(req: Request, res: Response) {
        try {
            const result = await this.service.deleteAssinatura(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao deletar assinatura");
        }
    }

    async updateAssinatura(req: Request, res: Response) {
        try {
            const data = assinaturaSchema.partial().parse(req.body);
            const result = await this.service.updateAssinatura(req.params.id, data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao atualizar assinatura");
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
