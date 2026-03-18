import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().uuid("Token inválido"),
  novaSenha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});