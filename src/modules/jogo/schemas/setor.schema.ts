import { z } from 'zod'

export const setorSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do setor").max(100),
    capacidade: z.coerce.number().int().min(1, "Capacidade deve ser um número inteiro positivo"),
});

export const updateSetorSchema = setorSchema.partial();