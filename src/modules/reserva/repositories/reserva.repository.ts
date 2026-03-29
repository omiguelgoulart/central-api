import { prisma } from "../../../lib/prisma";
import redis from "../../../lib/redis";
import { CheckoutConfirmarInput, ItemCreateInput, ItemPatchInput, PedidoCreateInput, PedidoPatchInput, ReservaBody } from "../types/reserva.type";

export class ReservaRepository {
  constructor(
    private readonly db = prisma,
    private readonly cache = redis,
    private readonly ttlMin = Number(process.env.RESERVA_TTL_MIN ?? 10)
  ) { }

  private key(partidaId: string, setorId: string) {
    return `reserva:${partidaId}:${setorId}`;
  }

  async segurarReserva(data: ReservaBody) {
    const k = this.key(data.partidaId, data.setorId);
    const current = Number(await this.cache.get(k)) || 0;
    const novoValor = current + Number(data.qtd);
    await this.cache.set(k, novoValor, "EX", this.ttlMin * 60);
    return { ok: true, reservado: novoValor, ttlMin: this.ttlMin };
  }

  async liberarReserva(data: ReservaBody) {
    const k = this.key(data.partidaId, data.setorId);
    const current = Number(await this.cache.get(k)) || 0;
    const novoValor = Math.max(0, current - Number(data.qtd));
    await this.cache.set(k, novoValor);
    return { ok: true, reservado: novoValor };
  }

  async listarReservas(partidaId: string) {
    const keys = await this.cache.keys(`reserva:${partidaId}:*`);
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

  async getReservadoRedis(partidaId: string, setorId: string) {
    return Number(await this.cache.get(this.key(partidaId, setorId))) || 0;
  }

  async getVendidosSetor(setorId: string) {
    return this.db.itemPedido.count({ where: { setorId, pedido: { status: "PAGO" } } });
  }

  async getLoteById(loteId: string) {
    return this.db.lote.findUnique({ where: { id: loteId } });
  }

  async createPedido(data: PedidoCreateInput & { itensComPreco: Array<any>; total: number }) {
    return this.db.pedido.create({
      data: {
        torcedorId: data.torcedorId,
        status: "RASCUNHO",
        total: data.total,
        expiraEm: data.expiraEm ? new Date(data.expiraEm) : undefined,
        itens: {
          create: data.itensComPreco.flatMap((i) =>
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
  }

  async getAllPedidos() {
    return this.db.pedido.findMany({ orderBy: { criadoEm: "desc" }, include: { itens: true } });
  }

  async getPedidoById(id: string) {
    return this.db.pedido.findUnique({ where: { id }, include: { itens: true } });
  }

  async updatePedido(id: string, patch: PedidoPatchInput) {
    return this.db.pedido.update({
      where: { id },
      data: {
        status: patch.status,
        total: typeof patch.total === "number" ? patch.total : undefined,
        expiraEm: patch.expiraEm ? new Date(patch.expiraEm) : undefined,
      },
    });
  }

  async deletePedido(id: string) {
    await this.db.itemPedido.deleteMany({ where: { pedidoId: id } });
    return this.db.pedido.delete({ where: { id } });
  }

  async addItensPedido(pedidoId: string, input: ItemCreateInput, preco: number) {
    return this.db.itemPedido.createMany({
      data: Array.from({ length: input.qtd }).map((_, idx) => ({
        pedidoId,
        setorId: input.setorId,
        tipo: input.tipo,
        preco,
        nomeTitular: input.titulares?.[idx]?.nome ?? null,
        torcedorCpf: input.titulares?.[idx]?.cpf ?? null,
      })),
    });
  }

  async getItemById(itemId: string) {
    return this.db.itemPedido.findUnique({ where: { id: itemId } });
  }

  async updateItem(itemId: string, patch: ItemPatchInput) {
    return this.db.itemPedido.update({
      where: { id: itemId },
      data: {
        tipo: patch.tipo,
        nomeTitular: patch.nomeTitular,
        torcedorCpf: patch.torcedorCpf,
      },
    });
  }

  async updateItemPreco(itemId: string, preco: number) {
    return this.db.itemPedido.update({ where: { id: itemId }, data: { preco } });
  }

  async deleteItem(itemId: string) {
    return this.db.itemPedido.delete({ where: { id: itemId } });
  }

  async recalcPedidoTotal(pedidoId: string) {
    const itens = await this.db.itemPedido.findMany({ where: { pedidoId } });
    const total = itens.reduce((sum, it) => sum + Number(it.preco), 0);
    await this.db.pedido.update({ where: { id: pedidoId }, data: { total } });
    return total;
  }

  async confirmarPedido(pedidoId: string) {
    return this.db.pedido.update({ where: { id: pedidoId }, data: { status: "RESERVA_ATIVA" } });
  }

  async createCheckoutPedido(data: CheckoutConfirmarInput & { total: number }) {
    return this.db.pedido.create({
      data: {
        torcedorId: data.torcedorId,
        status: "RESERVA_ATIVA",
        total: data.total,
        itens: {
          create: data.itens.flatMap((i) =>
            Array.from({ length: i.qtd }).map((_, idx) => ({
              setorId: i.setorId,
              tipo: i.tipo,
              preco: (i as any).preco,
              nomeTitular: i.titulares?.[idx]?.nome ?? null,
              torcedorCpf: i.titulares?.[idx]?.cpf ?? null,
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
