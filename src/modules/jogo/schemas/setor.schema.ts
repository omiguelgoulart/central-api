import { z } from 'zod'

export const setorSchema = z.object({
    slug: z.string().trim().min(1, "Informe o slug do setor").max(100),
    nome: z.string().trim().min(1, "Informe o nome do setor").max(100),
    tipo: z.enum(['ARQUIBANCADA', 'CADEIRA', 'CAMAROTE', 'VISITANTE', 'ACESSIVEL']).default('ARQUIBANCADA'),
});

export const updateSetorSchema = setorSchema.partial();