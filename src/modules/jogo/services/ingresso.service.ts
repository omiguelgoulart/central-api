import { IngressoRepository } from "../repositories/ingresso.repository";
import { CreateIngressoInput, UpdateIngressoInput } from "../types/ingresso.type";
import { IngressoUtil } from "../utils/ingresso.util";

export class IngressoService {
    constructor(private readonly ingressoRepository: IngressoRepository) {}

    async createIngresso(data: CreateIngressoInput) {
        const newIngresso = await this.ingressoRepository.createJogo(data);
        return {
            message: 'Ingresso criado com sucesso',
            ingressoId: newIngresso.id
        };
    }

    async getAllIngressos() {
        return this.ingressoRepository.getAllIngressos();
    }

    async getIngressoById(id: string) {
        const ingresso = await this.ingressoRepository.getIngressoById(id);
        if (!ingresso) {
            throw new Error('Ingresso não encontrado');
        }
        return ingresso;
    }

    async getIngressosByJogoId(jogoId: string) {
        return this.ingressoRepository.getIngressosByJogoId(jogoId);
    }

    async getIngressoQrCode(id: string) {
        const ingresso = await this.ingressoRepository.getIngressoQrCode(id);
        if (!ingresso) {
            throw new Error('Ingresso não encontrado');
        }
        return ingresso;
    }

    async deleteIngresso(id: string) {
        const ingressoExistente = await this.ingressoRepository.getIngressoById(id);
        if (!ingressoExistente) {
            throw new Error('Ingresso não encontrado');
        }
        await this.ingressoRepository.deleteIngresso(id);

        return {
            message: 'Ingresso deletado com sucesso'
        };
    }

    async updateIngresso(id: string, data: UpdateIngressoInput) {
        const ingressoExistente = await this.ingressoRepository.getIngressoById(id);
        if (!ingressoExistente) {
            throw new Error('Ingresso não encontrado');
        }
        await this.ingressoRepository.updateIngresso(id, data);

        return {
            message: 'Ingresso atualizado com sucesso'
        };
    }

    async updateIngressoStatus(id: string, status: string) {
        const ingressoExistente = await this.ingressoRepository.getIngressoById(id);
        if (!ingressoExistente) {
            throw new Error('Ingresso não encontrado');
        }
        await this.ingressoRepository.updateIngressoStatus(id, status as "VALIDO" | "USADO" | "CANCELADO");

        return {
            message: 'Status do ingresso atualizado com sucesso'
        };
    }

    formatValor(valor: string | number): string {
        return IngressoUtil.toDecimalStringTwoPlaces(valor);
    }
}