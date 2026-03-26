import { BeneficioRepository } from "../repositories/beneficio.repository";
import { CreateBeneficioInput, UpdateBeneficioInput } from "../types/beneficio.type";

export class BeneficioService {
    constructor(private readonly beneficioRepository: BeneficioRepository) {}

    async createBeneficio(data: CreateBeneficioInput) {
        const newBeneficio = await this.beneficioRepository.createBeneficio(data);
        if (!newBeneficio) {
            throw new Error('Erro ao criar benefício');
        }
        return {
            message: 'Benefício criado com sucesso',
            beneficioId: newBeneficio.id
        };
    }

    async getAllBeneficios() {
        return this.beneficioRepository.getAllBeneficios();
    }

    async getBeneficioById(id: string) {
        const beneficio = await this.beneficioRepository.getBeneficioById(id);
        if (!beneficio) {
            throw new Error('Benefício não encontrado');
        }
        return beneficio;
    }

    async deleteBeneficio(id: string) {
        const beneficioExistente = await this.beneficioRepository.getBeneficioById(id);
        if (!beneficioExistente) {
            throw new Error('Benefício não encontrado');
        }
        await this.beneficioRepository.deleteBeneficio(id);

        return {
            message: 'Benefício deletado com sucesso'
        };
    }

    async updateBeneficio(id: string, data: UpdateBeneficioInput) {
        const beneficioExistente = await this.beneficioRepository.getBeneficioById(id);
        if (!beneficioExistente) {
            throw new Error('Benefício não encontrado');
        }
        const updatedBeneficio = await this.beneficioRepository.updateBeneficio(id, data);
        if (!updatedBeneficio) {
            throw new Error('Erro ao atualizar benefício');
        }
        return {
            message: 'Benefício atualizado com sucesso',
            beneficioId: updatedBeneficio.id
        };
    }
}