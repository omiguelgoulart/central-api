import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient()

const planoSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do plano").max(100),
    valor: z.number().min(0, "Preço mensal deve ser positivo"),
    Periodicidade: z.enum(['MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'], {
        required_error: "Informe a periodicidade do plano"
    }),
    descricao: z.string().trim().min(1, "Informe a descrição do plano").max(500),
});

router.post("/", async (req, res) => {
    try {
        const { nome, valor, Periodicidade, descricao } = planoSchema.parse(req.body);
        const planoExistente = await prisma.plano.findUnique({
            where: { nome }
        });
        if (planoExistente) {
            res.status(400).json({ error: 'Plano já cadastrado' });
            return;
        }
        const novoPlano = await prisma.plano.create({
            data: {
                nome,
                valor,
                periodicidade: Periodicidade,
                descricao,
            }
        });
        res.status(201).json({ message: 'Plano criado com sucesso', planoId: novoPlano.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar plano' });
    }
});

router.get("/", async (req, res) => {
    try {
        const planos = await prisma.plano.findMany({
            include: {
                beneficios: true
            },
            orderBy: {
                valor: 'asc'
            }
        });
        res.status(200).json(planos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar planos' });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const plano = await prisma.plano.findUnique({
            where: { id },
            include: {
                beneficios: true
            }
        });
        if (!plano) {
            res.status(404).json({ error: 'Plano não encontrado' });
            return;
        }
        res.status(200).json(plano);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar plano' });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const planoExistente = await prisma.plano.findUnique({
            where: { id }
        });
        if (!planoExistente) {
            res.status(404).json({ error: 'Plano não encontrado' });
            return;
        }
        await prisma.plano.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Plano deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar plano' });
    }
});

router.patch("/:id", async (req, res) => {
    const planoId = req.params.id;
    if (!planoId) {
        res.status(400).json({ error: 'ID do plano inválido' });
        return;
    }
    try {
        const planoExistente = await prisma.plano.findUnique({
            where: { id: planoId.toString() }
        });
        if (!planoExistente) {
            res.status(404).json({ error: 'Plano não encontrado' });
            return;
        }
        const { nome, valor, Periodicidade, descricao } = planoSchema.partial().parse(req.body);
        if (nome && nome !== planoExistente.nome) {
            const nomeJaUsado = await prisma.plano.findUnique({
                where: { nome }
            });
            if (nomeJaUsado) {
                res.status(400).json({ error: 'Nome do plano já está em uso' });
                return;
            }
        }
        const planoAtualizado = await prisma.plano.update({
            where: { id: planoId.toString() },
            data: {
                nome: nome ?? planoExistente.nome,
                valor: valor ?? planoExistente.valor,
                periodicidade: Periodicidade ?? planoExistente.periodicidade,
                descricao: descricao ?? planoExistente.descricao,
            }
        });
        res.status(200).json({ message: 'Plano atualizado com sucesso', plano: planoAtualizado });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar plano' });
    }
});

export default router;