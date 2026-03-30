import { pedidoConfirmadoTemplate } from "../../emails/email-templates/pedido-confirmado.template";
import { sendEmail } from "../../emails/services/email.service";
import { ReservaRepository } from "../repositories/reserva.repository";
import { CheckoutConfirmarInput, ItemCreateInput, ItemPatchInput, PedidoCreateInput, PedidoPatchInput, ReservaBody } from "../types/reserva.type";

type HttpError = Error & {
    status?: number;
    details?: Record<string, unknown>;
};

type CheckoutItemComPreco = CheckoutConfirmarInput["itens"][number] & { preco: number };

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

    async listarReservas(partidaId: string) {
        return this.repository.listarReservas(partidaId);
    }

    private async validarDisponibilidade(partidaId: string, setorId: string, qtdDesejada: number) {
        const setor = await this.repository.getSetorById(setorId);
        if (!setor) throw new Error("Setor nao encontrado");
        const vendidos = await this.repository.getVendidosSetor(setorId);
        const reservado = await this.repository.getReservadoRedis(partidaId, setorId);
        const livres = setor.capacidade - (vendidos + reservado);
        if (livres < qtdDesejada) return { ok: false, livres };
        return { ok: true, livres };
    }

    async createPedido(data: PedidoCreateInput) {
        const itensComPreco = await Promise.all(
            data.itens.map(async (item) => {
                const lote = await this.repository.getLoteById(item.loteId);
                if (!lote) throw new Error(`Lote ${item.loteId} nao encontrado`);
                return { ...item, preco: Number(lote.precoUnitario) };
            })
        );

        const total = itensComPreco.reduce((sum, i) => sum + i.preco * i.qtd, 0);
        const pedido = await this.repository.createPedido({ ...data, itensComPreco, total });
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
            await this.repository.updateItemPreco(itemId, Number(lote.precoUnitario));
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

    async confirmarPedido(pedidoId: string, partidaId: string) {
        const pedido = await this.repository.getPedidoById(pedidoId);
        if (!pedido) throw new Error("Pedido nao encontrado");
        if (!pedido.itens.length) throw new Error("Pedido sem itens");

        const porSetor: Record<string, number> = {};
        for (const it of pedido.itens) porSetor[it.setorId] = (porSetor[it.setorId] || 0) + 1;

        for (const [setorId, qtd] of Object.entries(porSetor)) {
            const ok = await this.validarDisponibilidade(partidaId, setorId, qtd);
            if (!ok.ok) {
                const err = new Error("Setor sem disponibilidade suficiente");
                const typedErr = err as HttpError;
                typedErr.status = 409;
                typedErr.details = { setorId, livres: ok.livres };
                throw err;
            }
        }

        await this.repository.confirmarPedido(pedidoId);
        return { message: "Pedido confirmado e reservado com sucesso" };
    }

    async confirmarCheckout(data: CheckoutConfirmarInput) {
        const itensComPreco: CheckoutItemComPreco[] = [];
        for (const item of data.itens) {
            const lote = await this.repository.getLoteById(item.loteId);
            if (!lote) throw new Error(`Lote ${item.loteId} nao encontrado`);
            itensComPreco.push({ ...item, preco: Number(lote.precoUnitario) });
        }

        for (const item of itensComPreco) {
            const ok = await this.validarDisponibilidade(data.partidaId, item.setorId, item.qtd);
            if (!ok.ok) {
                const err = new Error("Setor sem disponibilidade suficiente");
                const typedErr = err as HttpError;
                typedErr.status = 409;
                typedErr.details = { setorId: item.setorId, livres: ok.livres };
                throw err;
            }
        }

        const total = itensComPreco.reduce((sum, i) => sum + Number(i.preco) * Number(i.qtd), 0);
        const pedido = await this.repository.createCheckoutPedido({ ...data, itens: itensComPreco, total });

        const torcedor = await this.repository.getTorcedorById(data.torcedorId);
        if (torcedor?.email) {
            this.sendEmailFn({
                to: torcedor.email,
                subject: "Pedido Confirmado!",
                html: String(pedidoConfirmadoTemplate({
                    nome: torcedor.nome,
                    pedidoId: pedido.id,
                    total,
                    itens: pedido.itens.map((item) => ({
                        setor: item.setorId,
                        tipo: item.tipo,
                        preco: Number(item.preco),
                    })),
                })),
            }).catch((err) => console.error("Erro email pedido confirmado:", err));
        }

        return { ok: true, pedidoId: pedido.id, total };
    }
}
