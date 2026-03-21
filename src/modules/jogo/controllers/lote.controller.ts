import { Request, Response } from "express";
import { ZodError } from "zod";

import { LoteService } from "../services/lote.service";
import { CreateLoteInput } from "../models/lote.repository";

export class LoteController {
    constructor(private readonly loteService: LoteService) { }

    async createLote(req: Request, res: Response) {
        try {
            const data = req.body as CreateLoteInput;
            const result = await this.loteService.createLote(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar lote', detalhe: String(error) });
        }
    }

    async getAllLotes(res: Response) {
        try {
            const lotes = await this.loteService.getAllLotes();
            res.status(200).json(lotes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar lotes', detalhe: String(error) });
        }
    }

    async getLoteById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const lote = await this.loteService.getLoteById(id);
            res.status(200).json(lote);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar lote', detalhe: String(error) });
        }
    }

    async deleteLote(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.loteService.deleteLote(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar lote', detalhe: String(error) });
        }
    }

    async updateLote(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = req.body as Partial<CreateLoteInput>;
            const result = await this.loteService.updateLote(id, data);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar lote', detalhe: String(error) });
        }
    }
}