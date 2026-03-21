import { Request, Response } from "express";
import { ZodError } from "zod";

import { SetorService } from "../services/setor.service";
import { setorSchema, updateSetorSchema } from "../schemas/setor.schema";

export class SetorController {
    private setorService: SetorService;

    constructor() {
        this.setorService = new SetorService();
    }

    async createSetor(req: Request, res: Response) {
        try {
            const data = setorSchema.parse(req.body);
            const result = await this.setorService.createSetor(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar setor', detalhe: String(error) });
        }
    }

    async getAllSetores(res: Response) {
        try {
            const setores = await this.setorService.getAllSetores();
            res.status(200).json(setores);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar setores', detalhe: String(error) });
        }
    }

    async getSetorById(req: Request, res: Response) {
        const { id } = req.params;
        try {            
            const setor = await this.setorService.getSetorById(id);
            res.status(200).json(setor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar setor', detalhe: String(error) });
        }

    }

    async deleteSetor(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.setorService.deleteSetor(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar setor', detalhe: String(error) });
        }
    }

    async updateSetor(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = updateSetorSchema.parse(req.body);
            const result = await this.setorService.updateSetor(id, data);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar setor', detalhe: String(error) });
        }
    }
}