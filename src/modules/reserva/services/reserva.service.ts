import { compraConfirmadaTemplate } from "../../emails/email-templates/compra-confirmada.template";
import { pedidoConfirmadoTemplate } from "../../emails/email-templates/pedido-confirmado.template";
import { sendEmail } from "../../emails/services/email.service";
import { ReservaRepository } from "../repositories/reserva.repository";
import { CheckoutConfirmarInput, ItemCreateInput, ItemPatchInput, PedidoCreateInput, PedidoPatchInput, ReservaBody } from "../types/reserva.type";

type HttpError = Error & {
    status?: number;
    details?: Record<string, unknown>;
};

type CheckoutItemComValor = CheckoutConfirmarInput["itens"][number] & { valorUnitario: number };

export class ReservaService {
    constructor(
        private readonly repository = new ReservaRepository(),
        private readonly sendEmailFn: typeof sendEmail = sendEmail
    ) { }

    async segurarReserva(data: ReservaBody) {
        return this.repository.segurarReserva(data);
    }

    async liberarReserva(data: ReservaBody) {
        return this.repository.liberarReserva(data);
    }

    async listarReservas(jogoId: string) {
        return this.repository.listarReservas(jogoId);
    }

    private async validarDisponibilidade(jogoId: string, setorId: string, qtdDesejada: number) {
        const setor = await this.repository.getSetorById(setorId);
        if (!setor) throw new Error("Setor nao encontrado");
        const vendidos = await this.repository.getVendidosSetor(jogoId, setorId);
        const reservado = await this.repository.getReservadoRedis(jogoId, setorId);
        const jogoSetor = await this.repository.getJogoSetorByIds(jogoId, setorId);
        if (!jogoSetor) throw new Error("Setor nao disponivel neste jogo");
        const livres = jogoSetor.capacidade - (vendidos + reservado);
        if (livres < qtdDesejada) return { ok: false, livres };
        return { ok: true, livres };
    }

    async createPedido(data: PedidoCreateInput) {
        const itensComValor = await Promise.all(
            data.itens.map(async (item) => {
                const lote = await this.repository.getLoteById(item.loteId);
                if (!lote) throw new Error(`Lote ${item.loteId} nao encontrado`);
                return { loteId: item.loteId, qtd: item.qtd };
            })
        );

        let total = 0;
        for (const i of itensComValor) {
            const lote = await this.repository.getLoteById(i.loteId);
            if (lote) total += Number(lote.precoUnitario) * i.qtd;
        }
        const pedido = await this.repository.createPedido({ ...data, itensComValor, total });
        return { message: "Pedido criado com sucesso", pedidoId: pedido.id, pedido };
    }

    async getAllPedidos() {
        return this.repository.getAllPedidos();
    }

    async getPedidoById(id: string) {
        const pedido = await this.repository.getPedidoById(id);
        if (!pedido) throw new Error("Pedido nao encontrado");
        return pedido;
    }

    async updatePedido(id: string, patch: PedidoPatchInput) {
        const pedido = await this.repository.getPedidoById(id);
        if (!pedido) throw new Error("Pedido nao encontrado");
        await this.repository.updatePedido(id, patch);
        return { message: "Pedido atualizado com sucesso" };
    }

    async deletePedido(id: string) {
        const pedido = await this.repository.getPedidoById(id);
        if (!pedido) throw new Error("Pedido nao encontrado");
        await this.repository.deletePedido(id);
        return { message: "Pedido deletado com sucesso" };
    }

    async addItensPedido(pedidoId: string, item: ItemCreateInput) {
        const pedido = await this.repository.getPedidoById(pedidoId);
        if (!pedido) throw new Error("Pedido nao encontrado");
        const lote = await this.repository.getLoteById(item.loteId);
        if (!lote) throw new Error("Lote nao encontrado");

        const result = await this.repository.addItensPedido(pedidoId, item, Number(lote.precoUnitario));
        const total = await this.repository.recalcPedidoTotal(pedidoId);
        return { message: "Itens adicionados com sucesso", adicionados: result.count, total };
    }

    async updateItemPedido(_pedidoId: string, itemId: string, patch: ItemPatchInput) {
        const item = await this.repository.getItemById(itemId);
        if (!item) throw new Error("Item nao encontrado");

        await this.repository.updateItem(itemId, patch);
        if (patch.loteId) {
            const lote = await this.repository.getLoteById(patch.loteId);
            if (!lote) throw new Error("Lote nao encontrado");
            await this.repository.updateItemValor(itemId, Number(lote.precoUnitario));
        }

        const total = await this.repository.recalcPedidoTotal(item.pedidoId);
        return { message: "Item atualizado com sucesso", total };
    }

    async deleteItemPedido(_pedidoId: string, itemId: string) {
        const item = await this.repository.getItemById(itemId);
        if (!item) throw new Error("Item nao encontrado");

        await this.repository.deleteItem(itemId);
        const total = await this.repository.recalcPedidoTotal(item.pedidoId);
        return { message: "Item removido com sucesso", total };
    }

    async confirmarPedido(pedidoId: string, jogoId: string) {
        const pedido = await this.repository.getPedidoById(pedidoId);
        if (!pedido) throw new Error("Pedido nao encontrado");
        if (!pedido.itens.length) throw new Error("Pedido sem itens");

        const porSetor: Record<string, number> = {};
        for (const it of pedido.itens) {
            const setorId = it.lote?.jogoSetor?.setorId;
            if (setorId) porSetor[setorId] = (porSetor[setorId] || 0) + 1;
        }

        for (const [setorId, qtd] of Object.entries(porSetor)) {
            const ok = await this.validarDisponibilidade(jogoId, setorId, qtd);
            if (!ok.ok) {
                const err = new Error("Setor sem disponibilidade suficiente");
                const typedErr = err as HttpError;
                typedErr.status = 409;
                typedErr.details = { setorId, livres: ok.livres };
                throw err;
            }
        }

        await this.repository.confirmarPedido(pedidoId);

        const torcedor = await this.repository.getTorcedorById(pedido.torcedorId);
        if (torcedor?.email) {
            const jogo = pedido.itens[0]?.lote?.jogo;
            const html = pedidoConfirmadoTemplate({
                nome: torcedor.nome,
                pedidoId: pedido.id,
                total: pedido.itens.reduce((sum, item) => sum + Number(item.valorUnitario), 0),
                itens: pedido.itens.map((item) => ({
                    setor: item.lote?.jogoSetor?.setor?.nome ?? "N/A",
                    tipo: item.lote?.tipo ?? "INTEIRA",
                    preco: Number(item.valorUnitario),
                })),
                evento: jogo?.nome,
                data: jogo?.data ? new Date(jogo.data).toLocaleDateString("pt-BR") : undefined,
                local: jogo?.local,
            });

            this.sendEmailFn({
                to: torcedor.email,
                subject: "Pedido Confirmado!",
                html,
            }).catch((err) => console.error("Erro email pedido confirmado:", err));
        }

        return { message: "Pedido confirmado e reservado com sucesso" };
    }

    async confirmarCheckout(data: CheckoutConfirmarInput) {
        const itensComValor: CheckoutItemComValor[] = [];
        for (const item of data.itens) {
            const lote = await this.repository.getLoteById(item.loteId);
            if (!lote) throw new Error(`Lote ${item.loteId} nao encontrado`);
            itensComValor.push({ ...item, valorUnitario: Number(lote.precoUnitario) });
        }

        for (const item of itensComValor) {
            const setorId = item.loteId; // Note: need to get setor from lote
            const ok = await this.validarDisponibilidade(data.jogoId, setorId, item.qtd);
            if (!ok.ok) {
                const err = new Error("Setor sem disponibilidade suficiente");
                const typedErr = err as HttpError;
                typedErr.status = 409;
                typedErr.details = { setorId, livres: ok.livres };
                throw err;
            }
        }

        const total = itensComValor.reduce((sum, i) => sum + Number(i.valorUnitario) * Number(i.qtd), 0);
        const pedido = await this.repository.createCheckoutPedido({ ...data, itens: itensComValor, total });

        const torcedor = await this.repository.getTorcedorById(data.torcedorId);
        if (torcedor?.email) {
            const primeiroLote = await this.repository.getLoteById(data.itens[0].loteId);

            this.sendEmailFn({
                to: torcedor.email,
                subject: "Compra Confirmada!",
                html: compraConfirmadaTemplate({
                    nomeTorcedor: torcedor.nome,
                    numeroIngresso: pedido.id.slice(0, 8).toUpperCase(),
                    evento: primeiroLote?.jogo?.nome ?? "Partida",
                    data: primeiroLote?.jogo?.data
                        ? new Date(primeiroLote.jogo.data).toLocaleDateString("pt-BR")
                        : "A definir",
                    local: primeiroLote?.jogo?.local ?? "A definir",
                    valor: total,
                    pedidoId: pedido.id,
                }),
            }).catch((err) => console.error("Erro email pedido confirmado:", err));
        }

        return { ok: true, pedidoId: pedido.id, total };
    }
}
