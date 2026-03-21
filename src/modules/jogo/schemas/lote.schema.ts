import { z } from 'zod'

export const loteSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do lote").max(100),
    tipo: z.enum(['INTEIRA', 'MEIA', 'CORTESIA', 'PROMO']).optional().default('INTEIRA'),
    quantidade: z.number().min(1, "A quantidade deve ser pelo menos 1"),
    precoUnitario: z.number().min(0, "O preço unitário deve ser pelo menos 0"),
    inicioVendas: z.string().refine((date) => !isNaN(Date.parse(date)), "Data de início de vendas inválida").optional(),
    fimVendas: z.string().refine((date) => !isNaN(Date.parse(date)), "Data de fim de vendas inválida").optional(),
    limitePorCPF: z.number().min(1, "O limite por CPF deve ser pelo menos 1").optional(),
    jogoId: z.string().uuid("ID do jogo inválido"),
    jogoSetorId: z.string().uuid("ID do setor do jogo inválido"),
});

export const updateLoteSchema = loteSchema.partial();