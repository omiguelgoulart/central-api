import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();

const prisma = new PrismaClient()

const jogoSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do jogo").max(100),
    data: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
    local: z.string().trim().min(1, "Informe o local do jogo").max(200).optional().default("Bento Freitas"),
    descricao: z.string().trim().max(500).optional(),
});

router.post("/", async (req, res) => {
    try {
        const { nome, data, local, descricao } = jogoSchema.parse(req.body);
        const novoJogo = await prisma.jogo.create({
            data: {
                nome,
                data: new Date(data),
                local,
                descricao
            }
        });
        res.status(201).json({ message: 'Jogo criado com sucesso', jogoId: novoJogo.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar jogo' });
    }
});

router.get("/", async (req, res) => {
    try {
        const jogos = await prisma.jogo.findMany();
        res.status(200).json(jogos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar jogos' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const jogo = await prisma.jogo.findUnique({
            where: { id: id }
        });
        if (!jogo) {
            res.status(404).json({ error: 'Jogo não encontrado' });
            return;
        }
        res.status(200).json(jogo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar jogo' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const jogo = await prisma.jogo.findUnique({
            where: { id: id }
        });
        if (!jogo) {
            res.status(404).json({ error: 'Jogo não encontrado' });
            return;
        }
        await prisma.jogo.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Jogo deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar jogo' });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, data, local, descricao } = jogoSchema.partial().parse(req.body);  
        const jogoExistente = await prisma.jogo.findUnique({
            where: { id: id }
        });
        if (!jogoExistente) {
            res.status(404).json({ error: 'Jogo não encontrado' });
            return;
        }
        await prisma.jogo.update({
            where: { id: id },
            data: {
                nome,
                data: data ? new Date(data) : undefined,
                local,
                descricao
            }
        });
        res.status(200).json({ message: 'Jogo atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar jogo' });
    }
});

export default router;