import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { Router } from "express";
import { validaSenha } from "../../utils/validaSenha";
import { gerarMatricula } from "../../utils/matricula";

const router = Router();
const prisma = new PrismaClient()

const usuarioSchema = z.object({
    nome: z.string().trim().min(1, "Informe seu nome").max(120),
    email: z.string().trim().email("E-mail inválido").max(160),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(72),
});

router.post("/", async (req, res) => {
    try {
        const { nome, email, senha } = usuarioSchema.parse(req.body);
        validaSenha(senha);
        const usuarioExistente = await prisma.torcedor.findUnique({
            where: { email }
        });
        if (usuarioExistente) {
            res.status(400).json({ error: 'E-mail já cadastrado' });
            return;
        }
        const senhaHash = await bcrypt.hash(senha, 10);

        // Gerar matrícula
        const matricula = await gerarMatricula();
        const novoUsuario = await prisma.torcedor.create({
            data: {
                nome,
                email,
                senha: senhaHash,
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
});

router.get("/", async (req, res) => {
    try {
        const usuarios = await prisma.torcedor.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                matricula: true
            }
        });
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

router.get("/matricula/:matricula", async (req, res) => {
    const { matricula } = req.params;
    try {
        const usuario = await prisma.torcedor.findUnique({
            where: { matricula },
            select: {
                id: true,
                nome: true,
                email: true,
                matricula: true
            }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

router.delete("/matricula/:matricula", async (req, res) => {
    const { matricula } = req.params;
    try {
        const usuario = await prisma.torcedor.findUnique({
            where: { matricula }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        await prisma.torcedor.delete({
            where: { matricula }
        });
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

router.patch("/matricula/:matricula", async (req, res) => {
    const { matricula } = req.params;
    try {
        const usuarioExistente = await prisma.torcedor.findUnique({
            where: { matricula }
        });
        if (!usuarioExistente) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        const { nome, email, senha } = usuarioSchema.partial().parse(req.body);
        if (senha) {
            validaSenha(senha);
        }
        const senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;
        await prisma.torcedor.update({
            where: { matricula },
            data: {
                nome: nome ?? usuarioExistente.nome,
                email: email ?? usuarioExistente.email,
                senha: senhaHash ?? usuarioExistente.senha
            }
        });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const usuarioExistente = await prisma.torcedor.findUnique({
            where: { id }
        });
        if (!usuarioExistente) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        const { nome, email, senha } = usuarioSchema.partial().parse(req.body);
        if (senha) {
            validaSenha(senha);
        }
        const senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;
        await prisma.torcedor.update({
            where: { id },
            data: {
                nome: nome ?? usuarioExistente.nome,
                email: email ?? usuarioExistente.email,
                senha: senhaHash ?? usuarioExistente.senha
            }
        });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await prisma.torcedor.findUnique({
            where: { id }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        await prisma.torcedor.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await prisma.torcedor.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                matricula: true
            }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

export default router;
