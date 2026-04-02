import { Request, Response } from "express";
import { ZodError } from "zod";

import { IngressoService } from "../services/ingresso.service";
import { CreateIngressoInput, IngressoStatus } from "../types/ingresso.type";

export class IngressoController {
    constructor(private readonly ingressoService: IngressoService) { }

    async createIngresso(req: Request, res: Response) {
        try {
            const data = req.body as CreateIngressoInput;
            const result = await this.ingressoService.createIngresso(data);
            res.status(201).json(result);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar ingresso', detalhe: String(error) });
        }
    }

    async getAllIngressos(res: Response) {
        try {
            const ingressos = await this.ingressoService.getAllIngressos();
            res.status(200).json(ingressos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar ingressos', detalhe: String(error) });
        }
    }

    async getIngressoById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const ingresso = await this.ingressoService.getIngressoById(id);
            res.status(200).json(ingresso);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar ingresso', detalhe: String(error) });
        }
    }

    async getIngressosByJogoId(req: Request, res: Response) {
        const { jogoId } = req.params;
        try {
            const ingressos = await this.ingressoService.getIngressoById(jogoId);
            res.status(200).json(ingressos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar ingressos por jogo', detalhe: String(error) });
        }
    }

    async getIngressoQrCode(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const ingresso = await this.ingressoService.getIngressoByQrCode(id);
            res.status(200).json(ingresso);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar QR code do ingresso', detalhe: String(error) });
        }
    }

    async deleteIngresso(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.ingressoService.deleteIngresso(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar ingresso', detalhe: String(error) });
        }
    }

    async updateIngresso(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = req.body as Partial<CreateIngressoInput>;
            const result = await this.ingressoService.updateIngresso(id, data);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar ingresso', detalhe: String(error) });
        }
    }

    async updateIngressoStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body as { status: string };
        try {
            const result = await this.ingressoService.updateIngresso(id, { status: status as IngressoStatus });
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar status do ingresso', detalhe: String(error) });
        }
    }
}
