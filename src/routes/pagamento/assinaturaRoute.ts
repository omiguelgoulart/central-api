import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient()

const assinaturaSchema = z.object({
    torcedorId: z.string().uuid("ID do torcedor inválido"),
    planoId: z.string().uuid("ID do plano inválido"),
    status: z.enum(['ATIVA', 'CANCELADA', 'SUSPENSA', 'EXPIRADA'], { required_error: "Informe o status da assinatura" }),
    inicioEm: z.string().default(() => new Date().toISOString()),
    expiraEm: z.string().optional().nullable(),
    proximaCobrancaEm: z.string().optional().nullable(),
    canceladaEm: z.string().optional().nullable(),
    motivoCancelamento: z.string().optional().nullable(),
    suspensaEm: z.string().optional().nullable(),
    retomadaEm: z.string().optional().nullable(),
    periodicidade: z.enum(['MENSAL', 'TRIMESTRAL', 'ANUAL'], { required_error: "Informe a periodicidade" }).optional(),
    valorAtual: z.string().optional().nullable(),
    moeda: z.string().optional().nullable(),
    gatewayClienteId: z.string().optional().nullable(),
    gatewayAssinaturaId: z.string().optional().nullable()
});

router.post("/", async (req, res) => {
    try {
        const { torcedorId, planoId, status, inicioEm, expiraEm, proximaCobrancaEm } = assinaturaSchema.parse(req.body);
        const torcedorExistente = await prisma.torcedor.findUnique({
            where: { id: torcedorId }
        });
        if (!torcedorExistente) {
            res.status(400).json({ error: 'Torcedor não encontrado' });
            return;
        }
        const planoExistente = await prisma.plano.findUnique({
            where: { id: planoId }
        });
        if (!planoExistente) {
            res.status(400).json({ error: 'Plano não encontrado' });
            return;
        }
        const novaAssinatura = await prisma.assinatura.create({
            data: {
                torcedorId,
                planoId,
                status,
                inicioEm: new Date(inicioEm),
                expiraEm: expiraEm ? new Date(expiraEm) : null,
                proximaCobrancaEm: proximaCobrancaEm ? new Date(proximaCobrancaEm) : null
            }
        });
        res.status(201).json(novaAssinatura);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar assinatura' });
    }
});

router.get("/", async (req, res) => {
    try {
        const assinaturas = await prisma.assinatura.findMany({
            include: {
                torcedor: true,
                plano: true
            }
        });
        res.status(200).json(assinaturas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar assinaturas' });
    }
});

router.get("/:id", async (req, res) => {
    const assinaturaId = req.params.id;
    try {
        const assinatura = await prisma.assinatura.findUnique({
            where: { id: assinaturaId },
            include: {
                torcedor: true,
                plano: true
            }
        });
        if (!assinatura) {
            res.status(404).json({ error: 'Assinatura não encontrada' });
            return;
        }
        res.status(200).json(assinatura);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }
});

router.delete("/:id", async (req, res) => {
    const assinaturaId = req.params.id;
    try {
        const assinaturaExistente = await prisma.assinatura.findUnique({
            where: { id: assinaturaId }
        });
        if (!assinaturaExistente) {
            res.status(404).json({ error: 'Assinatura não encontrada' });
            return;
        }
        await prisma.assinatura.delete({
            where: { id: assinaturaId }
        });
        res.status(200).json({ message: 'Assinatura deletada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar assinatura' });
    }
});

router.patch("/:id", async (req, res) => {
    const assinaturaId = req.params.id;
    try {
        const assinaturaExistente = await prisma.assinatura.findUnique({
            where: { id: assinaturaId }
        });
        if (!assinaturaExistente) {
            res.status(404).json({ error: 'Assinatura não encontrada' });
            return;
        }
        const dadosAtualizados = assinaturaSchema.partial().parse(req.body) as any;
        if (dadosAtualizados.inicioEm) {
            dadosAtualizados.inicioEm = new Date(dadosAtualizados.inicioEm);
        }
        if (dadosAtualizados.fimEm) {
            dadosAtualizados.fimEm = new Date(dadosAtualizados.fimEm);
        }
        if (dadosAtualizados.proximaCobrancaEm) {
            dadosAtualizados.proximaCobrancaEm = new Date(dadosAtualizados.proximaCobrancaEm);
        }
        await prisma.assinatura.update({
            where: { id: assinaturaId },
            data: dadosAtualizados
        });
        res.status(200).json({ message: 'Assinatura atualizada com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar assinatura' });
    }
});

export default router;