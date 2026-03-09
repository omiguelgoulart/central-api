import { PrismaClient } from "@prisma/client"
import { Router, Request, Response } from "express";
import redis from "../../lib/redis";

const router = Router();
const prisma = new PrismaClient();

function key(partidaId: string, setorId: string) {
    return `reserva:${partidaId}:${setorId}`;
}

async function getCapVendidos(partidaId: string, setorId: string) {
    const setor = await prisma.setor.findUnique({ where: { id: setorId } });
    if (!setor) throw new Error("Setor não encontrado");

    const vendidos = await prisma.itemPedido.count({
        where: {
            setorId,
            pedido: { status: "PAGO" },
        },
    });

    return { capacidade: setor.capacidade, vendidos };
}

router.post("/confirmar", async (req: Request, res: Response) => {
    try {
        const { partidaId, torcedorId, itens } = req.body;

        if (!partidaId || !torcedorId || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ error: "Payload inválido" });
        }

        for (const i of itens) {
            if (!i.loteId) {
                return res.status(400).json({ error: "loteId é obrigatório em cada item" });
            }
            const lote = await prisma.lote.findUnique({ where: { id: i.loteId } });
            if (!lote) {
                return res.status(400).json({ error: `Lote ${i.loteId} não encontrado` });
            }

            i.preco = Number(lote.precoUnitario);
        }

        for (const i of itens) {
            const { capacidade, vendidos } = await getCapVendidos(partidaId, i.setorId);
            const reservadoRedis = Number(await redis.get(key(partidaId, i.setorId))) || 0;

            const comprometido = vendidos + reservadoRedis;

            const livres = capacidade - comprometido;
            if (livres < i.qtd) {
                return res.status(409).json({
                    error: "Setor sem disponibilidade suficiente",
                    setorId: i.setorId,
                    livres,
                });
            }
        }

        const total = itens.reduce((sum: number, i: any) => sum + Number(i.preco) * Number(i.qtd), 0);

        const pedido = await prisma.pedido.create({
            data: {
                torcedorId,
                status: "RESERVA_ATIVA",
                total,
                itens: {
                    create: itens.flatMap((i: any) =>
                        Array.from({ length: i.qtd }).map((_, idx) => ({
                            setorId: i.setorId,
                            tipo: i.tipo,
                            preco: i.preco,
                            nomeTitular: i.titulares?.[idx]?.nome ?? null,
                            torcedorCpf: i.titulares?.[idx]?.cpf ?? null,
                        }))
                    ),
                },
            },
            include: { itens: true },
        });

        return res.status(201).json({ ok: true, pedidoId: pedido.id, total });
    } catch {
        return res.status(500).json({ error: "Falha ao confirmar pedido" });
    }
});

export default router;
