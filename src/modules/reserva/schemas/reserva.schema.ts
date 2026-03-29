import { StatusPedido, TipoIngresso } from "@prisma/client";
import { z } from "zod";

export const reservaBodySchema = z.object({
    partidaId: z.string().min(1),
    setorId: z.string().min(1),
    qtd: z.coerce.number().int().positive(),
});

export const pedidoCreateSchema = z.object({
    torcedorId: z.string().trim().min(1, "Informe o torcedor"),
    expiraEm: z.string().datetime().optional(),
    itens: z
        .array(
            z.object({
                setorId: z.string().trim().min(1),
                tipo: z.nativeEnum(TipoIngresso),
                loteId: z.string().uuid("loteId invalido"),
                qtd: z.number().int().positive().default(1),
                titulares: z
                    .array(
                        z.object({
                            nome: z.string().trim().min(1),
                            cpf: z.string().trim().min(11).max(14),
                        })
                    )
                    .optional(),
            })
        )
        .min(1, "Inclua ao menos 1 item"),
});

export const pedidoPatchSchema = z.object({
    status: z.nativeEnum(StatusPedido).optional(),
    total: z.number().nonnegative().optional(),
    expiraEm: z.string().datetime().optional(),
});

export const itemCreateSchema = z.object({
    setorId: z.string().trim().min(1),
    tipo: z.nativeEnum(TipoIngresso),
    loteId: z.string().uuid("loteId invalido"),
    qtd: z.number().int().positive().default(1),
    titulares: z
        .array(
            z.object({
                nome: z.string().trim().min(1),
                cpf: z.string().trim().min(11).max(14),
            })
        )
        .optional(),
});

export const itemPatchSchema = z.object({
    tipo: z.nativeEnum(TipoIngresso).optional(),
    loteId: z.string().uuid().optional(),
    nomeTitular: z.string().trim().min(1).optional(),
    torcedorCpf: z.string().trim().min(11).max(14).optional(),
});

export const confirmarPedidoSchema = z.object({
    partidaId: z.string().trim().min(1, "Informe a partida"),
});

export const checkoutConfirmarSchema = z.object({
    partidaId: z.string().trim().min(1),
    torcedorId: z.string().trim().min(1),
    itens: z
        .array(
            z.object({
                setorId: z.string().trim().min(1),
                tipo: z.nativeEnum(TipoIngresso),
                loteId: z.string().uuid("loteId invalido"),
                qtd: z.number().int().positive(),
                titulares: z.array(z.object({ nome: z.string().min(1), cpf: z.string().min(11).max(14) })).optional(),
            })
        )
        .min(1),
});
