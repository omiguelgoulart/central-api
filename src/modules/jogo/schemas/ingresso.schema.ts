import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });

export const ingressoSchema = z.object({
    itemPedidoId: z.string().uuid("ID do item do pedido inválido"),
    qrCode: z.string().min(1, "QR Code inválido"),
    status: z.enum(["VALIDO", "USADO", "CANCELADO", "EXPIRADO", "ESTORNADO"]).default("VALIDO").optional(),
    usadoEm: z.date().optional(),
});

export const updateIngressoSchema = ingressoSchema.partial();

export const createIngressoComPagamentoSchema = z.object({
    loteId: z.string().uuid("ID do lote inválido"),
    pagamentoId: z.string().optional(),
}); 