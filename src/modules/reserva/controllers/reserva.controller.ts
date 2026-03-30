import { Request, Response } from "express";
import { ZodError } from "zod";

import { checkoutConfirmarSchema, confirmarPedidoSchema, itemCreateSchema, itemPatchSchema, pedidoCreateSchema, pedidoPatchSchema, reservaBodySchema } from "../schemas/reserva.schema";
import { ReservaService } from "../services/reserva.service";

type HttpError = Error & {
    status?: number;
    details?: Record<string, unknown>;
};

export class ReservaController {
    constructor(private readonly service = new ReservaService()) { }

    async segurarReserva(req: Request, res: Response) {
        try {
            const data = reservaBodySchema.parse(req.body);
            const result = await this.service.segurarReserva(data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Falha ao segurar reserva");
        }
    }

    async liberarReserva(req: Request, res: Response) {
        try {
            const data = reservaBodySchema.parse(req.body);
            const result = await this.service.liberarReserva(data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Falha ao liberar reserva");
        }
    }

    async listarReservas(req: Request, res: Response) {
        try {
            const result = await this.service.listarReservas(req.params.partidaId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Falha ao listar reservas");
        }
    }

    async createPedido(req: Request, res: Response) {
        try {
            const data = pedidoCreateSchema.parse(req.body);
            const result = await this.service.createPedido(data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao criar pedido");
        }
    }

    async getAllPedidos(res: Response) {
        try {
            const result = await this.service.getAllPedidos();
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar pedidos");
        }
    }

    async getPedidoById(req: Request, res: Response) {
        try {
            const result = await this.service.getPedidoById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao buscar pedido");
        }
    }

    async updatePedido(req: Request, res: Response) {
        try {
            const data = pedidoPatchSchema.parse(req.body);
            const result = await this.service.updatePedido(req.params.id, data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao atualizar pedido");
        }
    }

    async deletePedido(req: Request, res: Response) {
        try {
            const result = await this.service.deletePedido(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao deletar pedido");
        }
    }

    async addItensPedido(req: Request, res: Response) {
        try {
            const data = itemCreateSchema.parse(req.body);
            const result = await this.service.addItensPedido(req.params.id, data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao adicionar itens");
        }
    }

    async updateItemPedido(req: Request, res: Response) {
        try {
            const data = itemPatchSchema.parse(req.body);
            const result = await this.service.updateItemPedido(req.params.id, req.params.itemId, data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao atualizar item");
        }
    }

    async deleteItemPedido(req: Request, res: Response) {
        try {
            const result = await this.service.deleteItemPedido(req.params.id, req.params.itemId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao remover item");
        }
    }

    async confirmarPedido(req: Request, res: Response) {
        try {
            const data = confirmarPedidoSchema.parse(req.body);
            const result = await this.service.confirmarPedido(req.params.id, data.partidaId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, "Erro ao confirmar pedido");
        }
    }

    async confirmarCheckout(req: Request, res: Response) {
        try {
            const data = checkoutConfirmarSchema.parse(req.body);
            const result = await this.service.confirmarCheckout(data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res, "Falha ao confirmar pedido");
        }
    }

    private handleError(error: unknown, res: Response, fallbackMessage: string) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        const typedError = error as HttpError;
        if (error instanceof Error && typedError.status) {
            res.status(typedError.status).json({ error: error.message, ...(typedError.details ?? {}) });
            return;
        }
        if (error instanceof Error && error.message.includes("nao encontrado")) {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error instanceof Error && error.message.includes("sem itens")) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error(error);
        res.status(500).json({ error: fallbackMessage });
    }
}
