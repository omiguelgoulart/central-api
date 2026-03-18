import { z } from "zod"

export const beneficioSchema = z.object({
  slug: z.string().trim().min(1, "Informe o slug do benefício").max(100),
  titulo: z.string().trim().min(1, "Informe o título do benefício").max(100),
  descricao: z.string().trim().max(500).optional(),
  icone: z.string().trim().max(200).optional(),
  ativo: z.boolean().optional(),
  planoId: z.string().trim().min(1, "Informe o ID do plano"),
  destaque: z.boolean().optional(),
  observacao: z.string().trim().max(500).optional(),
})

export const updateBeneficioSchema = beneficioSchema.partial()
