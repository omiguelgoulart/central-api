import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();

const prisma = new PrismaClient()

const setorSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do setor").max(100),
    capacidade: z.number().min(1, "A capacidade deve ser pelo menos 1"),
});

router.post("/", async (req, res) => {
    try {
        const { nome, capacidade } = setorSchema.parse(req.body);
        const setorExistente = await prisma.setor.findUnique({
            where: { nome }
        });
        if (setorExistente) {
            res.status(400).json({ error: 'Setor já cadastrado' });
            return;
        }
        const novoSetor = await prisma.setor.create({
            data: {
                nome,
                capacidade
            }
        });
        res.status(201).json({ message: 'Setor criado com sucesso', setorId: novoSetor.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar setor' });
    }
});

router.get("/", async (req, res) => {
    try {
        const setores = await prisma.setor.findMany();
        res.status(200).json(setores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar setores' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const setor = await prisma.setor.findUnique({
            where: { id: id }
        });
        if (!setor) {
            res.status(404).json({ error: 'Setor não encontrado' });
            return;
        }
        res.status(200).json(setor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar setor' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const setor = await prisma.setor.findUnique({
            where: { id: id }
        });
        if (!setor) {
            res.status(404).json({ error: 'Setor não encontrado' });
            return;
        }
        await prisma.setor.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Setor deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar setor' });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, capacidade } = setorSchema.partial().parse(req.body);
        const setorExistente = await prisma.setor.findUnique({
            where: { id: id }
        });
        if (!setorExistente) {
            res.status(404).json({ error: 'Setor não encontrado' });
            return;
        }
        await prisma.setor.update({
            where: { id: id },
            data: {
                nome: nome ?? setorExistente.nome,
                capacidade: capacidade ?? setorExistente.capacidade
            }
        });
        res.status(200).json({ message: 'Setor atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar setor' });
    }
});

export default router;