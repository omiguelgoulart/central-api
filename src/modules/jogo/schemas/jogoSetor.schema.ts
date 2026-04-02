import { z } from "zod";

export const jogoSetorSchema = z.object({
  jogoId: z.string().uuid("ID do jogo inválido"),
  setorId: z.string().uuid("ID do setor inválido"),
  capacidade: z.number().min(1, "A capacidade deve ser pelo menos 1"),
  aberto: z.boolean().default(true),
});

export const updateJogoSetorSchema = jogoSetorSchema.partial();