import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient()

const faturaSchema = z.object({
    assinaturaId: z.string().uuid(),
    competencia: z.string(), 
    valor: z.number(), // ou z.number().transform(val => new Prisma.Decimal(val)) se usar Decimal do Prisma
    status: z.enum(['ABERTA', 'PAGA', 'CANCELADA']).optional(),
    vencimentoEm: z.coerce.date(),
    pagoEm: z.coerce.date().nullable().optional(),
    referencia: z.string().nullable().optional(),
    metodo: z.enum(['CARTAO', 'BOLETO', 'PIX']).nullable().optional(), // ajuste conforme seu enum
    criadoEm: z.coerce.date().optional(),
    atualizadoEm: z.coerce.date().optional(),
});

router.post("/", async (req, res) => {
    try {
        const { assinaturaId, competencia, valor, status, vencimentoEm, pagoEm, referencia, metodo } = faturaSchema.parse(req.body);
        const assinaturaExistente = await prisma.assinatura.findUnique({
            where: { id: assinaturaId }
        }); 
        if (!assinaturaExistente) {
            res.status(400).json({ error: 'Assinatura não encontrada' });
            return;
        }
        const novaFatura = await prisma.fatura.create({
            data: {
                assinaturaId,
                competencia,
                valor: Number(valor),
                status: status || 'ABERTA',
                vencimentoEm,
                pagoEm: pagoEm || null,
                referencia: referencia || null,
            }
        });
        res.status(201).json({ message: 'Fatura criada com sucesso', faturaId: novaFatura.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar fatura' });
    }
});

router.get("/", async (req, res) => {
    try {
        const faturas = await prisma.fatura.findMany();
        res.status(200).json(faturas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar faturas' });
    }
});

router.get("/:id", async (req, res) => {
    const faturaId = req.params.id;
    try {
        const fatura = await prisma.fatura.findUnique({
            where: { id: faturaId },
            include: { assinatura: true }
        });
        if (!fatura) {
            res.status(404).json({ error: 'Fatura não encontrada' });
            return;
        }
        res.status(200).json(fatura);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar fatura' });
    }
});

router.delete("/:id", async (req, res) => {
    const faturaId = req.params.id;
    try {
        const fatura = await prisma.fatura.findUnique({
            where: { id: faturaId }
        });
        if (!fatura) {
            res.status(404).json({ error: 'Fatura não encontrada' });
            return;
        }
        await prisma.fatura.delete({
            where: { id: faturaId }
        });
        res.status(200).json({ message: 'Fatura deletada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar fatura' });
    }
});

router.patch("/:id", async (req, res) => {
    const faturaId = req.params.id;
    try {
        const { assinaturaId, competencia, valor, status, vencimentoEm, pagoEm, referencia, metodo } = faturaSchema.partial().parse(req.body);
        const faturaExistente = await prisma.fatura.findUnique({
            where: { id: faturaId }
        });
        if (!faturaExistente) {
            res.status(404).json({ error: 'Fatura não encontrada' });
            return;
        }
        const dadosAtualizados: any = {};
        if (assinaturaId) {
            const assinaturaExistente = await prisma.assinatura.findUnique({
                where: { id: assinaturaId }
            });
            if (!assinaturaExistente) {
                res.status(400).json({ error: 'Assinatura não encontrada' });
                return;
            }
            dadosAtualizados.assinaturaId = assinaturaId;
        }
        if (competencia) dadosAtualizados.competencia = competencia;
        if (valor) dadosAtualizados.valor = Number(valor);
        if (status) dadosAtualizados.status = status;
        if (vencimentoEm) dadosAtualizados.vencimentoEm = vencimentoEm;
        if (pagoEm !== undefined) dadosAtualizados.pagoEm = pagoEm;
        if (referencia !== undefined) dadosAtualizados.referencia = referencia;
        if (metodo !== undefined) dadosAtualizados.metodo = metodo;
        const faturaAtualizada = await prisma.fatura.update({
            where: { id: faturaId },
            data: dadosAtualizados
        });
        res.status(200).json({ message: 'Fatura atualizada com sucesso', fatura: faturaAtualizada });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar fatura' });
    }
});

export default router;