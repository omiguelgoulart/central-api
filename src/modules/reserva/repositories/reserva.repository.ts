import { prisma } from "../../../lib/prisma";
import redis from "../../../lib/redis";
import { CheckoutConfirmarInput, ItemCreateInput, ItemPatchInput, PedidoCreateInput, PedidoPatchInput, ReservaBody } from "../types/reserva.type";

type ItemPedidoComValor = {
  loteId: string;
  qtd: number;
};

type CheckoutItemComValor = {
  loteId: string;
  qtd: number;
};

export class ReservaRepository {
  constructor(
    private readonly db = prisma,
    private readonly cache = redis,
    private readonly ttlMin = Number(process.env.RESERVA_TTL_MIN ?? 10)
  ) { }

  private key(jogoId: string, setorId: string) {
    return `reserva:${jogoId}:${setorId}`;
  }

  async segurarReserva(data: ReservaBody) {
    const k = this.key(data.jogoId, data.setorId);
    const current = Number(await this.cache.get(k)) || 0;
    const novoValor = current + Number(data.qtd);
    await this.cache.set(k, novoValor, "EX", this.ttlMin * 60);
    return { ok: true, reservado: novoValor, ttlMin: this.ttlMin };
  }

  async liberarReserva(data: ReservaBody) {
    const k = this.key(data.jogoId, data.setorId);
    const current = Number(await this.cache.get(k)) || 0;
    const novoValor = Math.max(0, current - Number(data.qtd));
    await this.cache.set(k, novoValor);
    return { ok: true, reservado: novoValor };
  }

  async listarReservas(jogoId: string) {
    const keys = await this.cache.keys(`reserva:${jogoId}:*`);
    const result: Record<string, number> = {};
    for (const k of keys) {
      const setorId = k.split(":")[2];
      result[setorId] = Number(await this.cache.get(k)) || 0;
    }
    return result;
  }

  async getSetorById(setorId: string) {
    return this.db.setor.findUnique({ where: { id: setorId } });
  }

  async getJogoSetorByIds(jogoId: string, setorId: string) {
    return this.db.jogoSetor.findUnique({
      where: { jogoId_setorId: { jogoId, setorId } },
    });
  }

  async getReservadoRedis(jogoId: string, setorId: string) {
    return Number(await this.cache.get(this.key(jogoId, setorId))) || 0;
  }

  async getVendidosSetor(jogoId: string, setorId: string) {
    return this.db.itemPedido.count({
      where: {
        lote: {
          jogoSetor: {
            jogoId,
            setorId,
          },
        },
        pedido: { status: "PAGO" },
      },
    });
  }

  async getLoteById(loteId: string) {
    return this.db.lote.findUnique({
      where: { id: loteId },
      include: { jogoSetor: { include: { setor: true } } },
    });
  }

  async createPedido(data: PedidoCreateInput & { itensComValor: ItemPedidoComValor[]; total: number }) {
    return this.db.pedido.create({
      data: {
        torcedorId: data.torcedorId,
        status: "PENDENTE",
        expiraEm: data.expiraEm ? new Date(data.expiraEm) : undefined,
        itens: {
          create: data.itensComValor.flatMap((i) =>
            Array.from({ length: i.qtd }).map((_) => ({
              loteId: i.loteId,
              valorUnitario: 0,
            }))
          ),
        },
      },
      include: { itens: true },
    });
  }

  async getAllPedidos() {
    return this.db.pedido.findMany({
      orderBy: { criadoEm: "desc" },
      include: { itens: true },
    });
  }

  async getPedidoById(id: string) {
    return this.db.pedido.findUnique({
      where: { id },
      include: { itens: { include: { lote: { include: { jogoSetor: { include: { setor: true } } } } } } },
    });
  }

  async updatePedido(id: string, patch: PedidoPatchInput) {
    return this.db.pedido.update({
      where: { id },
      data: {
        status: patch.status,
        expiraEm: patch.expiraEm ? new Date(patch.expiraEm) : undefined,
      },
    });
  }

  async deletePedido(id: string) {
    await this.db.itemPedido.deleteMany({ where: { pedidoId: id } });
    return this.db.pedido.delete({ where: { id } });
  }

  async addItensPedido(pedidoId: string, input: ItemCreateInput, valorUnitario: number) {
    return this.db.itemPedido.createMany({
      data: Array.from({ length: input.qtd }).map((_) => ({
        pedidoId,
        loteId: input.loteId,
        valorUnitario,
      })),
    });
  }

  async getItemById(itemId: string) {
    return this.db.itemPedido.findUnique({ where: { id: itemId } });
  }

  async updateItem(itemId: string, _patch: ItemPatchInput) {
    return this.db.itemPedido.update({
      where: { id: itemId },
      data: {
      },
    });
  }

  async updateItemValor(itemId: string, valorUnitario: number) {
    return this.db.itemPedido.update({ where: { id: itemId }, data: { valorUnitario } });
  }

  async deleteItem(itemId: string) {
    return this.db.itemPedido.delete({ where: { id: itemId } });
  }

  async recalcPedidoTotal(pedidoId: string) {
    const itens = await this.db.itemPedido.findMany({ where: { pedidoId } });
    const total = itens.reduce((sum, it) => sum + Number(it.valorUnitario), 0);
    return total;
  }

  async confirmarPedido(pedidoId: string) {
    return this.db.pedido.update({ where: { id: pedidoId }, data: { status: "PAGO" } });
  }

  async createCheckoutPedido(data: Omit<CheckoutConfirmarInput, "itens"> & { itens: CheckoutItemComValor[]; total: number }) {
    return this.db.pedido.create({
      data: {
        torcedorId: data.torcedorId,
        status: "PAGO",
        itens: {
          create: data.itens.flatMap((i) =>
            Array.from({ length: i.qtd }).map((_) => ({
              loteId: i.loteId,
              valorUnitario: 0,
            }))
          ),
        },
      },
      include: { itens: true },
    });
  }

  async getTorcedorById(id: string) {
    return this.db.torcedor.findUnique({ where: { id }, select: { nome: true, email: true } });
  }
}
