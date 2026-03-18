import { z } from "zod";

export const jogoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do jogo").max(100),
  data: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
  local: z.string().trim().min(1, "Informe o local do jogo").max(200).optional().default("Bento Freitas"),
  descricao: z.string().trim().max(500).optional(),
});

export const updateJogoSchema = jogoSchema.partial();