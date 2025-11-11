import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();

const prisma = new PrismaClient()

const loteSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do lote").max(100),
    tipo: z.enum(['INTEIRA', 'MEIA', 'CORTESIA', 'PROMO']).optional().default('INTEIRA'),
    quantidade: z.number().min(1, "A quantidade deve ser pelo menos 1"),
    precoUnitario: z.number().min(0, "O preço unitário deve ser pelo menos 0"),
    inicioVendas: z.string().refine((date) => !isNaN(Date.parse(date)), "Data de início de vendas inválida").optional(),
    fimVendas: z.string().refine((date) => !isNaN(Date.parse(date)), "Data de fim de vendas inválida").optional(),
    limitePorCPF: z.number().min(1, "O limite por CPF deve ser pelo menos 1").optional(),
    jogoId: z.string().uuid("ID do jogo inválido"),
    jogoSetorId: z.string().uuid("ID do setor do jogo inválido"),
});

router.post("/", async (req, res) => {
    try {
        const { nome, tipo, quantidade, precoUnitario, inicioVendas, fimVendas, limitePorCPF, jogoId, jogoSetorId } = loteSchema.parse(req.body);
        const createData: any = {
            nome,
            quantidade,
            precoUnitario,
            inicioVendas: inicioVendas ? new Date(inicioVendas) : undefined,
            fimVendas: fimVendas ? new Date(fimVendas) : undefined,
            limitePorCPF,
            jogoId,
            jogoSetorId
        };
        if (typeof tipo !== 'undefined') {
            createData.tipo = tipo;
        }
        const novoLote = await prisma.lote.create({
            data: createData
        });
        res.status(201).json({ message: 'Lote criado com sucesso', loteId: novoLote.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar lote' });
    }
});

router.get("/", async (req, res) => {
    try {
        const lotes = await prisma.lote.findMany();
        res.status(200).json(lotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar lotes' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const lote = await prisma.lote.findUnique({
            where: { id: id }
        });
        if (!lote) {
            res.status(404).json({ error: 'Lote não encontrado' });
            return;
        }
        res.status(200).json(lote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar lote' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const lote = await prisma.lote.findUnique({
            where: { id: id }
        });
        if (!lote) {
            res.status(404).json({ error: 'Lote não encontrado' });
            return;
        }
        await prisma.lote.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Lote deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar lote' });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, quantidade, precoUnitario, inicioVendas, fimVendas, limitePorCPF, jogoId, jogoSetorId } = loteSchema.parse(req.body);
        const loteExistente = await prisma.lote.findUnique({
            where: { id }
        });
        if (!loteExistente) {
            res.status(404).json({ error: 'Lote não encontrado' });
            return;
        }

        const updatePayload: any = {
            nome,
            quantidade,
            precoUnitario,
            inicioVendas: inicioVendas ? new Date(inicioVendas) : null,
            fimVendas: fimVendas ? new Date(fimVendas) : null,
            limitePorCPF,
            jogoId,
            jogoSetorId
        };

        if (typeof tipo !== 'undefined') {
            updatePayload.tipo = tipo;
        }

        await prisma.lote.update({
            where: { id },
            data: updatePayload
        });
        res.status(200).json({ message: 'Lote atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar lote' });
    }
});

export default router;