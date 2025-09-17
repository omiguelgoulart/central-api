import { PrismaClient, Papel } from "@prisma/client"
import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { validaSenha } from "../utils/validaSenha";
import { gerarMatricula } from "../utils/matricula";

const prisma = new PrismaClient()

interface UsuarioLista {
    id: string;
    nome: string ;
    email: string;
    papel: string;
}


const usuarioSchema = z.object({
    nome: z.string().trim().min(1, "Informe seu nome").max(120),
    email: z.string().trim().email("E-mail inválido").max(160),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(72),
    papel: z.nativeEnum(Papel).optional(), // <— agora é o enum do Prisma
});

// para criação usa direto
const usuarioCreateSchema = usuarioSchema;

// para update usa .partial()
const usuarioUpdateSchema = usuarioSchema.partial();

export async function criaUsuario(req: Request, res: Response): Promise<void> {
    try {
        const { nome, email, senha, papel } = usuarioSchema.parse(req.body);
        validaSenha(senha);

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email }
        });
        if (usuarioExistente) {
            res.status(400).json({ error: 'E-mail já cadastrado' });
            return;
        }
        const senhaHash = await bcrypt.hash(senha, 10);

        // Gerar matrícula
        const matricula = await gerarMatricula();

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                papel: (papel as any) || 'TORCEDOR' as any,
                matricula
            }
        });

        res.status(201).json({ message: 'Usuário criado com sucesso', usuarioId: novoUsuario.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
}


export async function listaUsuarios(req: Request, res: Response): Promise<void> {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                papel: true,
                matricula: true
            }
        });
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
}

export async function deletaUsuario(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        } await prisma.usuario.delete({
            where: { id }
        });
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
}

export async function atualizaUsuario(req: Request, res: Response): Promise<void> {
  try {
    // valida id como UUID
    const { id } = z.object({ id: z.string().uuid("id inválido") }).parse(req.params);

    // valida body: todos opcionais, mas exige ao menos 1 campo
    const { nome, email, senha, papel } = usuarioSchema
      .partial()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: "Envie ao menos um campo para atualizar",
      })
      .parse(req.body);

    // valida e prepara dados
    const data: Record<string, any> = {};
    if (nome !== undefined) data.nome = nome;
    if (email !== undefined) data.email = email;
    if (papel !== undefined) data.papel = papel as any;

    if (senha !== undefined) {
      validaSenha(senha);
      data.senha = await bcrypt.hash(senha, 10);
    }

    const atualizado = await prisma.usuario.update({
      where: { id },
      data,
      // nunca retorne o hash
      select: { id: true, nome: true, email: true, papel: true },
    });

    res.json({ message: "Usuário atualizado com sucesso", usuario: atualizado });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(422).json({ errors: error.errors });
      return;
    }
    if (error?.code === "P2025") {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(409).json({ error: "E-mail já cadastrado" });
      return;
    }
    console.error(error);
    res.status(500).json({ 
      error: "Erro ao atualizar usuário", 
      detalhe: error?.message || "Erro desconhecido" 
    });
  }
}
