import { z } from "zod";

export const cartaoSchema = z.object({
    holderName: z.string().min(1),
    number: z.string().min(12),
    expiryMonth: z.string().min(1),
    expiryYear: z.string().min(4),
    ccv: z.string().min(3),
});

export const portadorSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    cpfCnpj: z.string().min(11),
    postalCode: z.string().min(5),
    addressNumber: z.string().min(1),
    phone: z.string().min(8),
});

export const criarClienteSchema = z.object({
    nome: z.string().min(1),
    email: z.string().email(),
    cpfCnpj: z.string().optional(),
});

export const pagamentoBaseSchema = z.object({
    customerId: z.string().min(1),
    valor: z.number().positive().optional(),
    descricao: z.string().min(1).default(""),
    dueDate: z.string().optional(),
    tipo: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"]),
    loteId: z.string().uuid().optional(),
    faturaId: z.string().uuid().optional(),
});

export const pagamentoUnionSchema = z.discriminatedUnion("tipo", [
    pagamentoBaseSchema.extend({ tipo: z.literal("PIX") }),
    pagamentoBaseSchema.extend({ tipo: z.literal("BOLETO") }),
    pagamentoBaseSchema.extend({
        tipo: z.literal("CREDIT_CARD"),
        cartao: cartaoSchema,
        portador: portadorSchema,
        installmentCount: z.number().int().min(1).optional(),
        capture: z.boolean().optional(),
    }),
    pagamentoBaseSchema.extend({
        tipo: z.literal("DEBIT_CARD"),
        cartao: cartaoSchema,
        portador: portadorSchema,
    }),
]);

export const tokenizeCardSchema = z.object({
    customerId: z.string().min(1),
    cartao: cartaoSchema,
    portador: portadorSchema,
});

export const idParamSchema = z.object({ id: z.string().min(1) });
export const paymentIdParamSchema = z.object({ paymentId: z.string().min(1) });
