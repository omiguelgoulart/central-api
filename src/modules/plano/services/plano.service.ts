import { PlanoModel } from "../models/plano.model";
import { CreatePlanoInput, UpdatePlanoInput } from "../types/plano.type";

export class PlanoService {
  private planoModel: PlanoModel;

    constructor() {
        this.planoModel = new PlanoModel();
    }

    async createPlano(data: CreatePlanoInput) {
        const planoExistente = await this.planoModel.getPlanoByNome(data.nome);
        if (planoExistente) {
            throw new Error('Já existe um plano com esse nome');
        }
        
        const newPlano = await this.planoModel.createPlano(data);

        return {
            message: 'Plano criado com sucesso',
            planoId: newPlano.id
        };
    }

    async getAllPlanos() {
        return this.planoModel.getAllPlanos();
    }

    async getPlanoById(id: string) {
        const plano = await this.planoModel.getPlanoById(id);
        if (!plano) {
            throw new Error('Plano não encontrado');
        }
        return plano;
    }

    async deletePlano(id: string) {
        const planoExistente = await this.planoModel.getPlanoById(id);
        if (!planoExistente) {
            throw new Error('Plano não encontrado');
        }
        await this.planoModel.deletePlano(id);

        return { 
            message: 'Plano deletado com sucesso' 
        };
    }

    async updatePlano(id: string, data: UpdatePlanoInput) {
        const planoExistente = await this.planoModel.getPlanoById(id);
        if (!planoExistente) {
            throw new Error('Plano não encontrado');
        }
        return this.planoModel.updatePlano(id, data);
    }
}


