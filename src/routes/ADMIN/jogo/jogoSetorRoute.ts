import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();

const prisma = new PrismaClient()

const jogoSetorSchema = z.object({
    jogoId: z.string().uuid("ID do jogo inválido"),
    setorId: z.string().uuid("ID do setor inválido"),
    capacidade: z.number().min(1, "A capacidade deve ser pelo menos 1"),
    aberto: z.boolean().optional().default(true),
    tipo: z.enum(['ARQUIBANCADA', 'CADEIRA', 'CAMAROTE', 'VISITANTE', 'ACESSIVEL']).optional().default('ARQUIBANCADA'),
});

router.post("/", async (req, res) => {
    try {
        const { jogoId, setorId, capacidade, aberto, tipo } = jogoSetorSchema.parse(req.body);
        const jogoSetorExistente = await prisma.jogoSetor.findFirst({
            where: { jogoId, setorId }
        });
        if (jogoSetorExistente) {
            res.status(400).json({ error: 'Setor já cadastrado para este jogo' });
            return;
        }
        const novoJogoSetor = await prisma.jogoSetor.create({
            data: {
                jogoId,
                setorId,
                capacidade,
                aberto,
                tipo
            }
        });
        res.status(201).json({ message: 'Setor do jogo criado com sucesso', jogoSetorId: novoJogoSetor.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar setor do jogo' });
    }
});

router.get("/", async (req, res) => {
    try {
        const jogoSetores = await prisma.jogoSetor.findMany();
        res.status(200).json(jogoSetores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar setores dos jogos' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const jogoSetor = await prisma.jogoSetor.findUnique({
            where: { id: id }
        });
        if (!jogoSetor) {
            res.status(404).json({ error: 'Setor do jogo não encontrado' });
            return;
        }
        res.status(200).json(jogoSetor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar setor do jogo' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const jogoSetor = await prisma.jogoSetor.findUnique({
            where: { id: id }
        });
        if (!jogoSetor) {
            res.status(404).json({ error: 'Setor do jogo não encontrado' });
            return;
        }
        await prisma.jogoSetor.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Setor do jogo deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar setor do jogo' });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { capacidade, aberto, tipo } = jogoSetorSchema.partial().parse(req.body);
        const jogoSetorExistente = await prisma.jogoSetor.findUnique({
            where: { id }
        });
        if (!jogoSetorExistente) {
            res.status(404).json({ error: 'Setor do jogo não encontrado' });
            return;
        }
        const jogoSetorAtualizado = await prisma.jogoSetor.update({
            where: { id },
            data: {
                capacidade,
                aberto,
                tipo
            }
        });
        res.status(200).json(jogoSetorAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar setor do jogo' });
    }
});

export default router;