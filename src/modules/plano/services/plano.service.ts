import { PlanoRepository } from "../repositories/plano.repository";
import { CreatePlanoInput, UpdatePlanoInput } from "../types/plano.type";

export class PlanoService {
    constructor(private readonly planoRepository: PlanoRepository) {}

    async createPlano(data: CreatePlanoInput) {
        const newPlano = await this.planoRepository.createPlano(data);
        if (!newPlano) {
            throw new Error('Erro ao criar plano');
        }
        return {
            message: 'Plano criado com sucesso',
            planoId: newPlano.id
        };
    }

    async getAllPlanos() {
        return this.planoRepository.getAllPlanos();
    }

    async getPlanoById(id: string) {
        const plano = await this.planoRepository.getPlanoById(id);
        if (!plano) {
            throw new Error('Plano não encontrado');
        }

        return plano;
    }

    async deletePlano(id: string) {
        const planoExistente = await this.planoRepository.getPlanoById(id);
        if (!planoExistente) {
            throw new Error('Plano não encontrado');
        }

        await this.planoRepository.deletePlano(id);

        return {
            message: 'Plano deletado com sucesso'
        };
    }

    async updatePlano(id: string, data: UpdatePlanoInput) {
        const planoExistente = await this.planoRepository.getPlanoById(id);
        if (!planoExistente) {
            throw new Error('Plano não encontrado');
        }

        const updatedPlano = await this.planoRepository.updatePlano(id, data);
        if (!updatedPlano) {
            throw new Error('Erro ao atualizar plano');
        }
        return {
            message: 'Plano atualizado com sucesso',
            planoId: updatedPlano.id
        };
    }
}