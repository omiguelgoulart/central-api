import { Request, Response } from "express";
import { ZodError } from "zod";

import { planoSchema, updatePlanoSchema } from "../schemas/plano.schema";
import { PlanoService } from "../services/plano.service";

export class PlanoController {
    constructor(private readonly planoService: PlanoService) {}

    async createPlano(req: Request, res: Response) {
        try {
            const data = planoSchema.parse(req.body);
            const result = await this.planoService.createPlano(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar plano', detalhe: String(error) });
        }
    }

    async getAllPlanos(req: Request, res: Response) {
        try {
            const planos = await this.planoService.getAllPlanos();
            res.status(200).json(planos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar planos', detalhe: String(error) });
        }
    }

    async getPlanoById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const plano = await this.planoService.getPlanoById(id);
            res.status(200).json(plano);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar plano', detalhe: String(error) });
        }
    }

    async deletePlano(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.planoService.deletePlano(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar plano', detalhe: String(error) });
        }
    }

    async updatePlano(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = updatePlanoSchema.parse(req.body);
            const updatedPlano = await this.planoService.updatePlano(id, data);
            res.status(200).json(updatedPlano);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar plano', detalhe: String(error) });
        }
    }
}