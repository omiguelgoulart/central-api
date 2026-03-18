import { z } from "zod";

export const usuarioSchema = z.object({
    matricula: z.number().optional(),
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    cpf: z.string().optional(),
    telefone: z.string().optional(),
    enderecoLogradouro: z.string().optional(),
    enderecoNumero: z.string().optional(),
    enderecoBairro: z.string().optional(),
    enderecoCidade: z.string().optional(),
    enderecoUF: z.string().optional(),
    enderecoCEP: z.string().optional(),
});

export const updateUsuarioSchema = usuarioSchema.partial();