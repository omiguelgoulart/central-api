import { Request, Response } from "express";
import { ZodError } from "zod";

import { JogoSetorService } from "../services/jogoSetor.service";
import { CreateJogoSetorInput, UpdateJogoSetorInput } from "../types/jogoSetor.type";

export class JogoSetorController {
    private jogoSetorService: JogoSetorService;

    constructor() {
        this.jogoSetorService = new JogoSetorService();
    }

    async createJogoSetor(req: Request, res: Response) {
        try {
            const data = req.body as CreateJogoSetorInput;
            const result = await this.jogoSetorService.createJogoSetor(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar jogoSetor', detalhe: String(error) });
        }
    }

    async getAllJogoSetores(res: Response) {
        try {
            const jogoSetores = await this.jogoSetorService.getAllJogoSetores();
            res.status(200).json(jogoSetores);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar jogoSetores', detalhe: String(error) });
        }
    }

    async getJogoSetorById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const jogoSetor = await this.jogoSetorService.getJogoSetorById(id);
            res.status(200).json(jogoSetor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar jogoSetor', detalhe: String(error) });
        }
    }

    async deleteJogoSetor(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.jogoSetorService.deleteJogoSetor(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar jogoSetor', detalhe: String(error) });
        }
    }

    async updateJogoSetor(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = req.body as UpdateJogoSetorInput;
            const result = await this.jogoSetorService.updateJogoSetor(id, data);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar jogoSetor', detalhe: String(error) });
        }
    }
}