import { PrismaClient, StatusPedido, TipoIngresso } from "@prisma/client";
import { z } from "zod";
import { Router } from "express";
import redis from "../../lib/redis";

const router = Router();
const prisma = new PrismaClient();


const pedidoCreateSchema = z.object({
    torcedorId: z.string().trim().min(1, "Informe o torcedor"),
    expiraEm: z.string().datetime().optional(), // ISO string
    itens: z.array(z.object({
        setorId: z.string().trim().min(1),
        tipo: z.nativeEnum(TipoIngresso),
        preco: z.number().positive("Preço deve ser > 0"),
        qtd: z.number().int().positive().default(1),
        titulares: z.array(z.object({
            nome: z.string().trim().min(1),
            cpf: z.string().trim().min(11).max(14),
        })).optional(), // 1 por ingresso; se não vier agora, pode ser atribuído depois
    })).min(1, "Inclua ao menos 1 item"),
});

const pedidoPatchSchema = z.object({
    status: z.nativeEnum(StatusPedido).optional(),
    total: z.number().nonnegative().optional(),
    expiraEm: z.string().datetime().optional(),
});

const itemCreateSchema = z.object({
    setorId: z.string().trim().min(1),
    tipo: z.nativeEnum(TipoIngresso),
    preco: z.number().positive(),
    qtd: z.number().int().positive().default(1),
    titulares: z.array(z.object({
        nome: z.string().trim().min(1),
        cpf: z.string().trim().min(11).max(14),
    })).optional(),
});

const itemPatchSchema = z.object({
    tipo: z.nativeEnum(TipoIngresso).optional(),
    preco: z.number().positive().optional(),
    nomeTitular: z.string().trim().min(1).optional(),
    torcedorCpf: z.string().trim().min(11).max(14).optional(),
});

const redisKey = (partidaId: string, setorId: string) => `reserva:${partidaId}:${setorId}`;


async function validarDisponibilidade(partidaId: string, setorId: string, qtdDesejada: number) {
    // Exemplo: busca capacidade em tabela Setor (ajuste conforme seu modelo)
    const setor = await prisma.setor.findUnique({ where: { id: setorId } });
    if (!setor) throw new Error("Setor não encontrado");

    const vendidos = await prisma.itemPedido.count({
        where: { setorId, pedido: { status: "PAGO" } },
    });
    const reservado = Number(await redis.get(redisKey(partidaId, setorId))) || 0;

    const comprometido = vendidos + reservado;
    const livres = setor.capacidade - comprometido;

    if (livres < qtdDesejada) {
        return { ok: false, livres };
    }
    return { ok: true, livres };
}

router.post("/", async (req, res) => {
    try {
        const payload = pedidoCreateSchema.parse(req.body);
        const { torcedorId, expiraEm, itens } = payload;

        const total = itens.reduce((sum, i) => sum + i.preco * i.qtd, 0);

        const pedido = await prisma.pedido.create({
            data: {
                torcedorId,
                status: "RASCUNHO",
                total,
                expiraEm: expiraEm ? new Date(expiraEm) : undefined,
                itens: {
                    create: itens.flatMap((i) =>
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

        res.status(201).json({ message: "Pedido criado com sucesso", pedidoId: pedido.id, pedido });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors }); return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao criar pedido" });
    }
});

router.get("/", async (_req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            orderBy: { criadoEm: "desc" },
            include: { itens: true },
        });
        res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const pedido = await prisma.pedido.findUnique({
            where: { id: req.params.id },
            include: { itens: true },
        });
        if (!pedido) {
            res.status(404).json({ error: "Pedido não encontrado" }); return;
        }
        res.status(200).json(pedido);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar pedido" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const patch = pedidoPatchSchema.parse(req.body);
        const exists = await prisma.pedido.findUnique({ where: { id: req.params.id } });
        if (!exists) {
            res.status(404).json({ error: "Pedido não encontrado" }); return;
        }

        await prisma.pedido.update({
            where: { id: req.params.id },
            data: {
                status: patch.status,
                total: typeof patch.total === "number" ? patch.total : undefined,
                expiraEm: patch.expiraEm ? new Date(patch.expiraEm) : undefined,
            },
        });

        res.status(200).json({ message: "Pedido atualizado com sucesso" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors }); return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar pedido" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const exists = await prisma.pedido.findUnique({ where: { id: req.params.id } });
        if (!exists) {
            res.status(404).json({ error: "Pedido não encontrado" }); return;
        }
        await prisma.itemPedido.deleteMany({ where: { pedidoId: req.params.id } });
        await prisma.pedido.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: "Pedido deletado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar pedido" });
    }
});


router.post("/:id/itens", async (req, res) => {
    try {
        const { setorId, tipo, preco, qtd, titulares } = itemCreateSchema.parse(req.body);
        const pedido = await prisma.pedido.findUnique({ where: { id: req.params.id } });
        if (!pedido) { res.status(404).json({ error: "Pedido não encontrado" }); return; }

        const itens = await prisma.itemPedido.createMany({
            data: Array.from({ length: qtd }).map((_, idx) => ({
                pedidoId: req.params.id,
                setorId,
                tipo,
                preco,
                nomeTitular: titulares?.[idx]?.nome ?? null,
                torcedorCpf: titulares?.[idx]?.cpf ?? null,
            })),
        });

        // recalcula total
        const itensPedido = await prisma.itemPedido.findMany({ where: { pedidoId: req.params.id } });
        const total = itensPedido.reduce((sum, it) => sum + Number(it.preco), 0);
        await prisma.pedido.update({ where: { id: req.params.id }, data: { total } });

        res.status(201).json({ message: "Itens adicionados com sucesso", adicionados: itens.count, total });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors }); return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao adicionar itens" });
    }
});


router.patch("/:id/itens/:itemId", async (req, res) => {
    try {
        const patch = itemPatchSchema.parse(req.body);
        const item = await prisma.itemPedido.findUnique({ where: { id: req.params.itemId } });
        if (!item) { res.status(404).json({ error: "Item não encontrado" }); return; }

        await prisma.itemPedido.update({
            where: { id: req.params.itemId },
            data: {
                tipo: patch.tipo,
                preco: typeof patch.preco === "number" ? patch.preco : undefined,
                nomeTitular: patch.nomeTitular,
                torcedorCpf: patch.torcedorCpf,
            },
        });

        // recalcula total
        const itensPedido = await prisma.itemPedido.findMany({ where: { pedidoId: item.pedidoId } });
        const total = itensPedido.reduce((sum, it) => sum + Number(it.preco), 0);
        await prisma.pedido.update({ where: { id: item.pedidoId }, data: { total } });

        res.status(200).json({ message: "Item atualizado com sucesso", total });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors }); return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar item" });
    }
});


router.delete("/:id/itens/:itemId", async (req, res) => {
    try {
        const item = await prisma.itemPedido.findUnique({ where: { id: req.params.itemId } });
        if (!item) { res.status(404).json({ error: "Item não encontrado" }); return; }

        await prisma.itemPedido.delete({ where: { id: req.params.itemId } });

        // recalcula total
        const itensPedido = await prisma.itemPedido.findMany({ where: { pedidoId: item.pedidoId } });
        const total = itensPedido.reduce((sum, it) => sum + Number(it.preco), 0);
        await prisma.pedido.update({ where: { id: item.pedidoId }, data: { total } });

        res.status(200).json({ message: "Item removido com sucesso", total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao remover item" });
    }
});

const confirmarSchema = z.object({
    partidaId: z.string().trim().min(1, "Informe a partida"),
});

router.post("/:id/confirmar", async (req, res) => {
    try {
        const { partidaId } = confirmarSchema.parse(req.body);

        const pedido = await prisma.pedido.findUnique({
            where: { id: req.params.id },
            include: { itens: true },
        });
        if (!pedido) { res.status(404).json({ error: "Pedido não encontrado" }); return; }
        if (!pedido.itens.length) { res.status(400).json({ error: "Pedido sem itens" }); return; }

        // valida disponibilidade para cada setor (somando reservas Redis + vendidos)
        const porSetor: Record<string, number> = {};
        for (const it of pedido.itens) porSetor[it.setorId] = (porSetor[it.setorId] || 0) + 1;

        for (const [setorId, qtd] of Object.entries(porSetor)) {
            const ok = await validarDisponibilidade(partidaId, setorId, qtd);
            if (!ok.ok) {
                return res.status(409).json({
                    error: "Setor sem disponibilidade suficiente",
                    setorId,
                    livres: ok.livres,
                });
            }
        }

        // tudo ok → status RESERVA_ATIVA (ou PENDENTE_PAGAMENTO se preferir)
        await prisma.pedido.update({
            where: { id: pedido.id },
            data: { status: "RESERVA_ATIVA" },
        });

        res.status(200).json({ message: "Pedido confirmado e reservado com sucesso" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors }); return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao confirmar pedido" });
    }
});

export default router;
