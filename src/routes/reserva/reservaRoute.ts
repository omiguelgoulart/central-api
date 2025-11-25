import { Router, Request, Response } from "express";
import redis from "../../lib/redis";

const router = Router();

// TTL padrão da reserva (minutos)
const TTL_MIN = Number(process.env.RESERVA_TTL_MIN ?? 10);

function key(partidaId: string, setorId: string) {
    return `reserva:${partidaId}:${setorId}`;
}

router.post("/segurar", async (req: Request, res: Response) => {
    try {
        const { partidaId, setorId, qtd } = req.body;
        if (!partidaId || !setorId || !qtd) return res.status(400).json({ error: "Dados inválidos" });

        const k = key(partidaId, setorId);
        const current = Number(await redis.get(k)) || 0;
        const novoValor = current + Number(qtd);

        await redis.set(k, novoValor, "EX", TTL_MIN * 60);
        return res.json({ ok: true, reservado: novoValor, ttlMin: TTL_MIN });
    } catch (e: any) {
        return res.status(500).json({ error: "Falha ao segurar reserva", detail: e?.message });
    }
});

router.post("/liberar", async (req: Request, res: Response) => {
    try {
        const { partidaId, setorId, qtd } = req.body;
        if (!partidaId || !setorId || !qtd) return res.status(400).json({ error: "Dados inválidos" });

        const k = key(partidaId, setorId);
        const current = Number(await redis.get(k)) || 0;
        const novoValor = Math.max(0, current - Number(qtd));
        await redis.set(k, novoValor);
        return res.json({ ok: true, reservado: novoValor });
    } catch (e: any) {
        return res.status(500).json({ error: "Falha ao liberar reserva", detail: e?.message });
    }
});


router.get("/:partidaId", async (req: Request, res: Response) => {
    try {
        const { partidaId } = req.params;
        const keys = await redis.keys(`reserva:${partidaId}:*`);
        const result: Record<string, number> = {};
        for (const k of keys) {
            const setorId = k.split(":")[2];
            result[setorId] = Number(await redis.get(k)) || 0;
        }
        return res.json(result);
    } catch (e: any) {
        return res.status(500).json({ error: "Falha ao listar reservas", detail: e?.message });
    }
});

export default router;
