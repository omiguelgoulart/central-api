import { PrismaClient } from "@prisma/client"
import { Router, Request, Response } from "express";
import redis from "../../lib/redis";

const router = Router();
const prisma = new PrismaClient();

/* 
  Espera que você tenha no banco:
  - model Setor { id, nome, capacidade ... }
  - model Pedido, ItemPedido, etc. (como te passei antes)
*/

// helpers
function key(partidaId: string, setorId: string) {
    return `reserva:${partidaId}:${setorId}`;
}

// retorna capacidade do setor e vendidos confirmados dessa partida
async function getCapVendidos(partidaId: string, setorId: string) {
    // capacidade do setor (ajuste: Se setor não for por partida, guarde relação em tabela de mapa de setores por partida)
    const setor = await prisma.setor.findUnique({ where: { id: setorId } });
    if (!setor) throw new Error("Setor não encontrado");

    // itens vendidos (pedidos PAGO) para essa partida/setor
    const vendidos = await prisma.itemPedido.count({
        where: {
            setorId,
            pedido: { status: "PAGO" }, // só finalizados contam como baixa definitiva
        },
    });

    return { capacidade: setor.capacidade, vendidos };
}

/**
 * POST /api/checkout/confirmar
 * body: {
 *   partidaId: string,
 *   torcedorId: string,
 *   itens: Array<{ setorId, tipo, preco, qtd, titulares: [{ nome, cpf }] }>
 * }
 */
router.post("/confirmar", async (req: Request, res: Response) => {
    try {
        const { partidaId, torcedorId, itens } = req.body;

        if (!partidaId || !torcedorId || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ error: "Payload inválido" });
        }

        // valida disponibilidade por setor
        for (const i of itens) {
            const { capacidade, vendidos } = await getCapVendidos(partidaId, i.setorId);
            const reservadoRedis = Number(await redis.get(key(partidaId, i.setorId))) || 0;

            // total comprometido = vendidos + reservas ativas (Redis)
            const comprometido = vendidos + reservadoRedis;

            // precisa existir "i.qtd" ingressos livres
            const livres = capacidade - comprometido;
            if (livres < i.qtd) {
                return res.status(409).json({
                    error: "Setor sem disponibilidade suficiente",
                    setorId: i.setorId,
                    livres,
                });
            }
        }

        // Se passou, grava o Pedido (status RESERVA_ATIVA). Você pode mudar para PENDENTE_PAGAMENTO, se preferir
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
                            tipo: i.tipo, // "INTEIRA" | "MEIA"
                            preco: i.preco,
                            nomeTitular: i.titulares?.[idx]?.nome ?? null,
                            torcedorCpf: i.titulares?.[idx]?.cpf ?? null,
                        }))
                    ),
                },
            },
            include: { itens: true },
        });

        // (Opcional) aqui você chama o Asaas para iniciar pagamento (PIX/cartão)
        // const cobranca = await asaas.criarPagamento({ pedidoId: pedido.id, total, ... });
        // retorna dados para próxima etapa do front (pagamento)
        return res.status(201).json({ ok: true, pedidoId: pedido.id, total /*, cobranca*/ });
    } catch (e: any) {
        return res.status(500).json({ error: "Falha ao confirmar pedido", detail: e?.message });
    }
});

export default router;
