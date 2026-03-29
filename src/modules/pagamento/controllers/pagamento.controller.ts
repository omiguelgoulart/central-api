import { Request, Response } from "express";
import { ZodError } from "zod";

import { pagamentoSchema } from "../schemas/pagamento.schema";
import { PagamentoService } from "../services/pagamento.service";

export class PagamentoController {
    constructor(private readonly service = new PagamentoService()) { }

    async createPagamento(req: Request, res: Response) {
        try {
            const data = pagamentoSchema.parse(req.body);
            const result = await this.service.createPagamento(data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao criar pagamento");
        }
    }

    async getAllPagamentos(res: Response) {
        try {
            const result = await this.service.getAllPagamentos();
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar pagamentos");
        }
    }

    async getPagamentoById(req: Request, res: Response) {
        try {
            const result = await this.service.getPagamentoById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar pagamento");
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
