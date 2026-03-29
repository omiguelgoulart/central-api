import { PagamentoRepository } from "../repositories/pagamento.repository";
import { CreatePagamentoInput } from "../types/pagamento.type";

export class PagamentoService {
    constructor(private readonly repository = new PagamentoRepository()) { }

    async createPagamento(data: CreatePagamentoInput) {
        const torcedor = await this.repository.getTorcedorById(data.torcedorId);
        if (!torcedor) {
            throw new Error("Torcedor nao encontrado");
        }
        const novo = await this.repository.createPagamento(data);
        return { message: "Pagamento criado com sucesso", pagamentoId: novo.id };
    }

    async getAllPagamentos() {
        return this.repository.getAllPagamentos();
    }

    async getPagamentoById(id: string) {
        const pagamento = await this.repository.getPagamentoById(id);
        if (!pagamento) throw new Error("Pagamento nao encontrado");
        return pagamento;
    }
}
