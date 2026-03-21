import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });

export const ingressoSchema = z.object({
    torcedorId: z.string().uuid("ID do torcedor inválido").optional(),
    jogoId: z.string().uuid("ID do jogo inválido"),
    loteId: z.string().uuid("ID do lote inválido").optional(),
    qrCode: z.string().min(1, "QR Code inválido").optional(),
    valor: z.number().positive("Valor deve ser positivo"),
    status: z.enum(["VALIDO", "USADO", "CANCELADO"]).default("VALIDO").optional(),
    criadoEm: z.date().optional(),
    usadoEm: z.date().optional(),
    atualizadoEm: z.date().optional(),
    pagamentoId: z.string().uuid("ID do pagamento inválido").optional(),
});

export const updateIngressoSchema = ingressoSchema.partial(); 