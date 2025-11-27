import { PrismaClient, StatusIngresso } from "@prisma/client";
import { z } from "zod";
import { Router } from "express";
import { buildQrPayload, genQrToken, toDataURL, toPNG } from "../../../lib/qr";

const router = Router();
const prisma = new PrismaClient();

const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });

function toDecimalStringTwoPlaces(v: string | number) {
  const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  if (Number.isNaN(num)) throw new Error("Valor inválido");
  return num.toFixed(2);
}

function parseOptionalDate(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v;
  const dt = new Date(String(v));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const ingressoCreateSchema = z.object({
  jogoId: z.string().uuid("ID do jogo inválido"),
  loteId: z.string().uuid("ID do lote inválido").optional(),
  valor: z.union([z.string(), z.number()]).transform(toDecimalStringTwoPlaces),
  torcedorId: z.string().uuid("ID do torcedor inválido").optional(),
  pagamentoId: z.string().min(1, "pagamentoId vazio").optional(),
});

const ingressoUpdateSchema = z.object({
  jogoId: z.string().uuid().optional(),
  loteId: z.string().uuid().nullable().optional(),
  valor: z.union([z.string(), z.number()]).optional().transform((v) => (v == null ? v : toDecimalStringTwoPlaces(v))),
  status: z.nativeEnum(StatusIngresso).optional(),
  usadoEm: z.union([z.string(), z.date()]).optional(),
  pagamentoId: z.string().min(1, "pagamentoId vazio").nullable().optional(),
  torcedorId: z.string().uuid("ID do torcedor inválido").nullable().optional(),
});

router.post("/", async (req, res) => {
  try {
    const { jogoId, loteId, valor, torcedorId, pagamentoId } =
      ingressoCreateSchema.parse(req.body);

    const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } });
    if (!jogo) return res.status(400).json({ error: "Jogo inválido" });

    if (loteId) {
      const lote = await prisma.lote.findUnique({ where: { id: loteId } });
      if (!lote) return res.status(400).json({ error: "Lote inválido" });
    }

    if (torcedorId) {
      const torcedor = await prisma.torcedor.findUnique({
        where: { id: torcedorId },
      });
      if (!torcedor)
        return res.status(400).json({ error: "Torcedor inválido" });
    }

    const result = await prisma.$transaction(async (tx) => {
      let qrToken = genQrToken();
      let created: { id: string; qrCode: string } | null = null;

      // tenta gerar um QR único até 5 vezes
      for (let i = 0; i < 5; i++) {
        try {
          const ingresso = await tx.ingresso.create({
            data: {
              jogoId,
              loteId: loteId ?? null,
              valor,
              qrCode: qrToken,
              status: StatusIngresso.VALIDO,
              torcedorId: torcedorId ?? null,
            },
            select: { id: true, qrCode: true },
          });
          created = ingresso;
          break;
        } catch (e: any) {
          // P2002 = unique constraint (provavelmente qrCode duplicado)
          if (e?.code === "P2002") {
            qrToken = genQrToken();
            continue;
          }
          throw e;
        }
      }

      if (!created) throw new Error("Falha ao gerar QR único");

      const payload = buildQrPayload(created.id, created.qrCode);
      const dataUrl = await toDataURL(payload);

      return { ingresso: created, dataUrl };
    });

    return res.status(201).json({
      message: "Ingresso criado com sucesso",
      ingressoId: result.ingresso.id,
      qrCodeToken: result.ingresso.qrCode,
      qrPngDataUrl: result.dataUrl,
      qrPngUrl: `/ingressos/${result.ingresso.id}/qrcode.png`,
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return res.status(400).json({ errors: e.errors });
    if ((e as any)?.message === "Valor inválido")
      return res.status(400).json({ error: "Valor inválido" });
    console.error(e);
    return res.status(500).json({ error: "Erro ao criar ingresso" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filtersSchema = z.object({
      jogoId: z.string().uuid().optional(),
      status: z.nativeEnum(StatusIngresso).optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
    });

    const { jogoId, status, page, pageSize } = filtersSchema.parse(req.query);
    const where = {
      ...(jogoId ? { jogoId } : {}),
      ...(status ? { status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.ingresso.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ingresso.count({ where }),
    ]);

    res.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao buscar ingressos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const ingresso = await prisma.ingresso.findUnique({ where: { id } });
    if (!ingresso)
      return res.status(404).json({ error: "Ingresso não encontrado" });
    res.json(ingresso);
  } catch (e) {
    if (e instanceof z.ZodError)
      return res.status(400).json({ errors: e.errors });
    console.error(e);
    res.status(500).json({ error: "Erro ao buscar ingresso" });
  }
});

router.get("/:id/qrcode.png", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const ingresso = await prisma.ingresso.findUnique({
      where: { id },
      select: { id: true, qrCode: true },
    });
    if (!ingresso)
      return res.status(404).json({ error: "Ingresso não encontrado" });

    const payload = buildQrPayload(ingresso.id, ingresso.qrCode);
    const png = await toPNG(payload);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.send(png);
  } catch (e) {
    if (e instanceof z.ZodError)
      return res.status(400).json({ errors: e.errors });
    console.error(e);
    res.status(500).json({ error: "Erro ao gerar QR" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = ingressoUpdateSchema.parse(req.body);

    const payload: any = {};
    if ("jogoId" in data) payload.jogoId = data.jogoId!;
    if ("loteId" in data) payload.loteId = data.loteId ?? null;
    if ("valor" in data) payload.valor = data.valor!;
    if ("status" in data) payload.status = data.status!;
    if ("usadoEm" in data)
      payload.usadoEm = parseOptionalDate(data.usadoEm!) ?? null;
    if ("pagamentoId" in data)
      payload.pagamentoId = data.pagamentoId ?? null;
    if ("torcedorId" in data)
      payload.torcedorId = data.torcedorId ?? null;

    await prisma.ingresso.update({ where: { id }, data: payload });
    res.json({ message: "Ingresso atualizado com sucesso" });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ errors: err.errors });
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar ingresso" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await prisma.ingresso.delete({ where: { id } });
    res.json({ message: "Ingresso deletado com sucesso" });
  } catch (e: any) {
    if (e instanceof z.ZodError)
      return res.status(400).json({ errors: e.errors });
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Ingresso não encontrado" });
    console.error(e);
    res.status(500).json({ error: "Erro ao deletar ingresso" });
  }
});

export default router;
