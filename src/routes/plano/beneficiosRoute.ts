import { PrismaClient, Prisma } from "@prisma/client"
import { z } from "zod"
import { Router } from "express"

const router = Router()
const prisma = new PrismaClient()

const beneficioSchema = z.object({
  slug: z.string().trim().min(1, "Informe o slug do benefício").max(100),
  titulo: z.string().trim().min(1, "Informe o título do benefício").max(100),
  descricao: z.string().trim().max(500).optional(),
  icone: z.string().trim().max(200).optional(),
  ativo: z.boolean().optional(),
  planoId: z.string().trim().min(1, "Informe o ID do plano"),
  destaque: z.boolean().optional(),
  observacao: z.string().trim().max(500).optional(),
})

// POST /beneficio
router.post("/", async (req, res) => {
  try {
    const { slug, titulo, descricao, icone, ativo, planoId, destaque, observacao } = beneficioSchema.parse(req.body)
    const beneficioExistente = await prisma.beneficio.findUnique({
      where: { slug },
    })
    if (beneficioExistente) {
      res.status(400).json({ error: "Slug já está em uso por outro benefício" })
      return
    }
    const planoExistente = await prisma.plano.findUnique({
        where: { id: planoId }, 
    })
    if (!planoExistente) {
      res.status(400).json({ error: "Plano não encontrado" })
      return
    }
    const novoBeneficio = await prisma.beneficio.create({
      data: {
        slug,
        titulo,
        descricao,
        icone,
        ativo: ativo ?? true,
        planoId,
        destaque: destaque ?? false,
        observacao,
      },
    })
    res.status(201).json(novoBeneficio)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors })
      return
    }
    console.error(error)
    res.status(500).json({ error: "Erro ao criar benefício" })
  }
})

// GET /beneficio?planoId=...
router.get("/", async (req, res) => {
  try {
    const { planoId } = req.query

    const where: Prisma.BeneficioWhereInput = {}

    if (typeof planoId === "string" && planoId.trim().length > 0) {
      where.planoId = planoId
    }

    const beneficios = await prisma.beneficio.findMany({
      where,
      orderBy: { ordem: "asc" },
    })

    res.status(200).json(beneficios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao buscar benefícios" })
  }
})

// GET /beneficio/:id
router.get("/:id", async (req, res) => {
  const beneficioId = req.params.id
  try {
    const beneficio = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
    })
    if (!beneficio) {
      res.status(404).json({ error: "Benefício não encontrado" })
      return
    }
    res.status(200).json(beneficio)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao buscar benefício" })
  }
})

// DELETE /beneficio/:id
router.delete("/:id", async (req, res) => {
  const beneficioId = req.params.id
  try {
    const beneficio = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
    })
    if (!beneficio) {
      res.status(404).json({ error: "Benefício não encontrado" })
      return
    }

    await prisma.beneficio.delete({
      where: { id: beneficioId },
    })

    res.status(200).json({ message: "Benefício deletado com sucesso" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao deletar benefício" })
  }
})

// PATCH /beneficio/:id
router.patch("/:id", async (req, res) => {
  const beneficioId = req.params.id
  try {
    const beneficioExistente = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
    })
    if (!beneficioExistente) {
      res.status(404).json({ error: "Benefício não encontrado" })
      return
    }

    const {slug, titulo, descricao, icone, ativo, planoId, destaque, observacao } = beneficioSchema.partial().parse(req.body)

    const dadosAtualizados: Prisma.BeneficioUpdateInput = {}

    if (slug) {
      const beneficioComMesmoSlug = await prisma.beneficio.findUnique({
        where: { slug },
      })
      if (beneficioComMesmoSlug && beneficioComMesmoSlug.id !== beneficioId) {
        res.status(400).json({ error: "Slug já está em uso por outro benefício" })
        return
      }
      dadosAtualizados.slug = slug
    }

    if (titulo !== undefined) {
      dadosAtualizados.titulo = titulo
    }

    if (descricao !== undefined) {
      dadosAtualizados.descricao = descricao
    }

    if (icone !== undefined) {
      dadosAtualizados.icone = icone
    }

    if (ativo !== undefined) {
      dadosAtualizados.ativo = ativo
    }

    if (planoId) {
      const planoExistente = await prisma.plano.findUnique({
        where: { id: planoId },
      })
      if (!planoExistente) {
        res.status(400).json({ error: "Plano não encontrado" })
        return
      }
      dadosAtualizados.plano = { connect: { id: planoId } }
    }

    if (destaque !== undefined) {
      dadosAtualizados.destaque = destaque
    }

    if (observacao !== undefined) {
      dadosAtualizados.observacao = observacao
    }

    await prisma.beneficio.update({
      where: { id: beneficioId },
      data: dadosAtualizados,
    })

    res.status(200).json({ message: "Benefício atualizado com sucesso" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors })
      return
    }
    console.error(error)
    res.status(500).json({ error: "Erro ao atualizar benefício" })
  }
})

export default router
