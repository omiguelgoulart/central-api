import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

const jogoSetorSchema = z.object({
  jogoId: z.string().uuid("ID do jogo inválido"),
  setorId: z.string().uuid("ID do setor inválido"),
  capacidade: z.number().min(1, "A capacidade deve ser pelo menos 1"),
  aberto: z.boolean().default(true),
  tipo: z.enum([
    "ARQUIBANCADA",
    "CADEIRA",
    "CAMAROTE",
    "VISITANTE",
    "ACESSIVEL",
  ]).default("ARQUIBANCADA"),
});

router.post("/", async (req, res) => {
  try {
    const data = jogoSetorSchema.parse(req.body);

    const existente = await prisma.jogoSetor.findFirst({
      where: {
        jogoId: data.jogoId,
        setorId: data.setorId,
      },
    });

    if (existente) {
      return res.status(400).json({
        error: "Este setor já está vinculado ao jogo",
      });
    }

    const novo = await prisma.jogoSetor.create({
      data,
      include: {
        setor: true,
        jogo: true,
      },
    });

    res.status(201).json(novo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao criar setor do jogo" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const itens = await prisma.jogoSetor.findMany({
      include: {
        setor: true,
        jogo: true,
      },
    });

    res.status(200).json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar setores dos jogos" });
  }
});

router.get("/jogo/:jogoId", async (req, res) => {
  try {
    const { jogoId } = req.params;

    const setores = await prisma.jogoSetor.findMany({
      where: { jogoId },
      include: {
        setor: true,
        jogo: true,
      },
      orderBy: { setor: { nome: "asc" } },
    });

    res.status(200).json(setores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar setores do jogo" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await prisma.jogoSetor.findUnique({
      where: { id: req.params.id },
      include: {
        setor: true,
        jogo: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Setor do jogo não encontrado" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar setor do jogo" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = jogoSetorSchema.partial().parse(req.body);
    const { id } = req.params;

    const existente = await prisma.jogoSetor.findUnique({ where: { id } });

    if (!existente) {
      return res.status(404).json({ error: "Setor do jogo não encontrado" });
    }

    const atualizado = await prisma.jogoSetor.update({
      where: { id },
      data,
      include: {
        setor: true,
        jogo: true,
      },
    });

    res.status(200).json(atualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar setor do jogo" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existente = await prisma.jogoSetor.findUnique({
      where: { id: req.params.id },
    });

    if (!existente) {
      return res.status(404).json({ error: "Setor do jogo não encontrado" });
    }

    await prisma.jogoSetor.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Setor do jogo deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar setor do jogo" });
  }
});

export default router;
