import { Request, Response } from "express";
import { ZodError } from "zod";

import { beneficioSchema, updateBeneficioSchema } from "../schemas/beneficio.schema";
import { BeneficioService } from "../services/beneficio.service";

export class BeneficioController {
    constructor(private readonly beneficioService: BeneficioService) { }

    async createBeneficio(req: Request, res: Response) {
        try {
            const data = beneficioSchema.parse(req.body);
            const result = await this.beneficioService.createBeneficio(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar benefício', detalhe: String(error) });
        }
    }

    async getAllBeneficios(req: Request, res: Response) {
        try {
            const beneficios = await this.beneficioService.getAllBeneficios();
            res.status(200).json(beneficios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar benefícios', detalhe: String(error) });
        }
    }

    async getBeneficioById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const beneficio = await this.beneficioService.getBeneficioById(id);
            res.status(200).json(beneficio);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar benefício', detalhe: String(error) });
        }
    }

    async deleteBeneficio(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.beneficioService.deleteBeneficio(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar benefício', detalhe: String(error) });
        }
    }

    async updateBeneficio(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = updateBeneficioSchema.parse(req.body);
            const updatedBeneficio = await this.beneficioService.updateBeneficio(id, data);
            res.status(200).json(updatedBeneficio);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar benefício', detalhe: String(error) });
        }
    }
}