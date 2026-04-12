import { Request, Response } from "express";
import { ZodError } from "zod";
import { createIngressoComPagamentoSchema } from "../schemas/ingresso.schema";
import { IngressoSimpleService } from "../services/ingresso-simple.service";

export class IngressoSimpleController {
    constructor(private readonly service: IngressoSimpleService) { }

    async criarIngressoComPagamento(req: Request, res: Response) {
        try {
            const data = createIngressoComPagamentoSchema.parse(req.body);
            const userId = req.userLogadoId;

            if (!userId) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }

            const result = await this.service.criarIngressoComPagamento(data, userId);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({
                error: 'Erro ao criar ingresso com pagamento',
                detalhe: error instanceof Error ? error.message : String(error)
            });
        }
    }
}
