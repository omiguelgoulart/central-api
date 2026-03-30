import { z } from "zod";

export const adminSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    role: z.enum(["SUPER_ADMIN", "OPERACIONAL", "PORTARIA"]).optional(),
});

export const updateAdminSchema = adminSchema.partial();