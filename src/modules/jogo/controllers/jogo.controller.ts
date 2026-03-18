import { Request, Response } from "express";
import { ZodError } from "zod";

import { JogoService } from "../services/jogo.service";
import { jogoSchema, updateJogoSchema } from "../schemas/jogo.schema";

export class JogoController {
    private jogoService: JogoService;

    constructor() {
        this.jogoService = new JogoService();
    }

    async createJogo(req: Request, res: Response) {
        try {
            const data = jogoSchema.parse(req.body);
            const result = await this.jogoService.createJogo(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar jogo', detalhe: String(error) });
        }

    }

    async getAllJogos(res: Response) {
        try {
            const jogos = await this.jogoService.getAllJogos();
            res.status(200).json(jogos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar jogos', detalhe: String(error) });
        }
    }

    async getJogoById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const jogo = await this.jogoService.getJogoById(id);
            res.status(200).json(jogo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar jogo', detalhe: String(error) });
        }
    }

    async deleteJogo(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.jogoService.deleteJogo(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar jogo', detalhe: String(error) });
        }
    }

    async updateJogo(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = updateJogoSchema.parse(req.body);
            const result = await this.jogoService.updateJogo(id, data);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar jogo', detalhe: String(error) });
        }
    }
}