import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient()

const beneficioSchema = z.object({
    slug: z.string().trim().min(1, "Informe o slug do benefício").max(100),
    titulo: z.string().trim().min(1, "Informe o título do benefício").max(100),
    descricao: z.string().trim().max(500).optional(),
    icone: z.string().trim().max(100).optional(),
    ativo: z.boolean().optional(),
    planoId: z.string().uuid("ID do plano inválido"),
    deetaque: z.boolean().optional(),
    observacao: z.string().max(500).optional(),

});

router.post("/", async (req, res) => {
    try {
        const { slug, titulo, descricao, icone, ativo, planoId, deetaque, observacao } = beneficioSchema.parse(req.body);
        const planoExistente = await prisma.plano.findUnique({
            where: { id: planoId }
        });
        if (!planoExistente) {
            res.status(400).json({ error: 'Plano não encontrado' });
            return;
        }
        const beneficioExistente = await prisma.beneficio.findUnique({
            where: { slug }
        });
        if (beneficioExistente) {
            res.status(400).json({ error: 'Benefício já cadastrado' });
            return;
        }
        const novoBeneficio = await prisma.beneficio.create({
            data: {
                slug,
                titulo,
                descricao: descricao || null,
                icone: icone || null,
                ativo: ativo !== undefined ? ativo : true,
                planoId,
                destaque: deetaque !== undefined ? deetaque : false,
                observacao: observacao || null,
            }
        });
        res.status(201).json({ message: 'Benefício criado com sucesso', beneficioId: novoBeneficio.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar benefício' });
    }
});

router.get("/", async (req, res) => {
    try {
        const beneficios = await prisma.beneficio.findMany();
        res.status(200).json(beneficios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar benefícios' });
    }
});

router.get("/:id", async (req, res) => {
    const beneficioId = req.params.id;
    try {
        const beneficio = await prisma.beneficio.findUnique({
            where: { id: beneficioId }
        });
        if (!beneficio) {
            res.status(404).json({ error: 'Benefício não encontrado' });
            return;
        }
        res.status(200).json(beneficio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar benefício' });
    }
});

router.delete("/:id", async (req, res) => {
    const beneficioId = req.params.id;
    try {
        const beneficio = await prisma.beneficio.findUnique({
            where: { id: beneficioId }
        });
        if (!beneficio) {
            res.status(404).json({ error: 'Benefício não encontrado' });
            return;
        }
        await prisma.beneficio.delete({
            where: { id: beneficioId }
        });
        res.status(200).json({ message: 'Benefício deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar benefício' });
    }
});

router.patch("/:id", async (req, res) => {
    const beneficioId = req.params.id;
    try {
        const beneficioExistente = await prisma.beneficio.findUnique({
            where: { id: beneficioId }
        });
        if (!beneficioExistente) {
            res.status(404).json({ error: 'Benefício não encontrado' });
            return;
        }
        const { slug, titulo, descricao, icone, ativo, planoId, deetaque, observacao } = beneficioSchema.partial().parse(req.body);
        const dadosAtualizados = {} as any;
        if (slug) {
            const beneficioComMesmoSlug = await prisma.beneficio.findUnique({
                where: { slug }
            });
            if (beneficioComMesmoSlug && beneficioComMesmoSlug.id !== beneficioId) {
                res.status(400).json({ error: 'Slug já está em uso por outro benefício' });
                return;
            }
            dadosAtualizados.slug = slug;
        }
        if (titulo) dadosAtualizados.titulo = titulo;
        if (descricao !== undefined) dadosAtualizados.descricao = descricao;
        if (icone !== undefined) dadosAtualizados.icone = icone;
        if (ativo !== undefined) dadosAtualizados.ativo = ativo;
        if (planoId) {
            const planoExistente = await prisma.plano.findUnique({
                where: { id: planoId }
            });
            if (!planoExistente) {
                res.status(400).json({ error: 'Plano não encontrado' });
                return;
            }
            dadosAtualizados.planoId = planoId;
        }
        if (deetaque !== undefined) dadosAtualizados.destaque = deetaque;
        if (observacao !== undefined) dadosAtualizados.observacao = observacao;
        await prisma.beneficio.update({
            where: { id: beneficioId },
            data: dadosAtualizados
        });
        res.status(200).json({ message: 'Benefício atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar benefício' });
    }
});

export default router;