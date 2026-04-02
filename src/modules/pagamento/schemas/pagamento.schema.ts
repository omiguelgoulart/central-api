import { MetodoPagamento, StatusFatura, StatusAssinatura } from "@prisma/client";
import { z } from "zod";

export const pagamentoSchema = z.object({
    torcedorId: z.string().uuid("ID do torcedor invalido"),
    valor: z.coerce.number({ required_error: "Informe o valor do pagamento" }),
    status: z.enum(['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'], { required_error: "Informe o status do pagamento" }),
    dataVencimento: z.coerce.date({ required_error: "Informe a data de vencimento" }),
    pagoEm: z.coerce.date().optional(),
    referencia: z.string().trim().max(120).optional(),
    metodo: z.nativeEnum(MetodoPagamento, { required_error: "Informe o metodo de pagamento" }),
    descricao: z.string().trim().max(500).optional(),
    faturaId: z.string().uuid().optional(),
});

export const faturaSchema = z.object({
    assinaturaId: z.string().uuid(),
    competencia: z.string(),
    valor: z.number(),
    status: z.nativeEnum(StatusFatura).optional(),
    vencimentoEm: z.coerce.date(),
    pagoEm: z.coerce.date().nullable().optional(),
    referencia: z.string().nullable().optional(),
    metodo: z.nativeEnum(MetodoPagamento).nullable().optional(),
});

export const assinaturaSchema = z.object({
    torcedorId: z.string().uuid("ID do torcedor invalido"),
    planoId: z.string().uuid("ID do plano invalido"),
    status: z.nativeEnum(StatusAssinatura, {
        required_error: "Informe o status da assinatura",
    }),
    inicioEm: z.string().default(() => new Date().toISOString()),
    expiraEm: z.string().optional().nullable(),
    proximaCobrancaEm: z.string().optional().nullable(),
    canceladaEm: z.string().optional().nullable(),
    motivoCancelamento: z.string().optional().nullable(),
    suspensaEm: z.string().optional().nullable(),
    retomadaEm: z.string().optional().nullable(),
    periodicidade: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).optional(),
    valorAtual: z.string().optional().nullable(),
    moeda: z.string().optional().nullable(),
    gatewayClienteId: z.string().optional().nullable(),
    gatewayAssinaturaId: z.string().optional().nullable(),
});

export const pagamentoIngressoSchema = z.object({
    pedidoId: z.string().uuid("ID do pedido invalido"),
    total: z.number().positive("Total deve ser positivo"),
    status: z.enum(['AGUARDANDO', 'APROVADO', 'RECUSADO', 'ESTORNADO']).default("AGUARDANDO").optional(),
    provider: z.string().min(1, "Provider é obrigatório"),
    externalId: z.string().optional(),
});

export const updatePagamentoIngressoSchema = pagamentoIngressoSchema.partial();
