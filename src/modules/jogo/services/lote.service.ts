import { CreateLoteInput, LoteRepository } from "../repositories/lote.repository";

export class LoteService {
    constructor(private readonly loteRepository: LoteRepository) { }

    async createLote(data: CreateLoteInput) {
        const newLote = await this.loteRepository.createLote(data);

        return {
            message: 'Lote criado com sucesso',
            loteId: newLote.id
        };
    }

    async getAllLotes() {
        return this.loteRepository.getAllLotes();
    }

    async getLoteById(id: string) {
        const lote = await this.loteRepository.getLoteById(id);
        if (!lote) {
            throw new Error('Lote não encontrado');
        }
        return lote;
    }

    async deleteLote(id: string) {
        const loteExistente = await this.loteRepository.getLoteById(id);
        if (!loteExistente) {
            throw new Error('Lote não encontrado');
        }
        await this.loteRepository.deleteLote(id);

        return {
            message: 'Lote deletado com sucesso'
        };
    }

    async updateLote(id: string, data: Partial<CreateLoteInput>) {
        const loteExistente = await this.loteRepository.getLoteById(id);
        if (!loteExistente) {
            throw new Error('Lote não encontrado');
        }
        const updatedLote = await this.loteRepository.updateLote(id, data);
        return updatedLote;
    }
}