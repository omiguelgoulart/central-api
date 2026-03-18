import { z } from 'zod';

export const planoSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do plano").max(100),
    valor: z.number().min(0, "Preço mensal deve ser positivo"),
    Periodicidade: z.enum(['MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'], {
        required_error: "Informe a periodicidade do plano"
    }),
    descricao: z.string().trim().min(1, "Informe a descrição do plano").max(500),
});

export const updatePlanoSchema = planoSchema.partial();