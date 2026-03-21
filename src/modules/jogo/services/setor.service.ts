import { SetorModel } from "../models/setor.model";
import { CreateSetorInput, UpdateSetorInput } from "../../setor/types/setor.type";

export class SetorService {
    private setorModel: SetorModel;

    constructor() {
        this.setorModel = new SetorModel();
    }

    async createSetor(data: CreateSetorInput) {
        const newSetor = await this.setorModel.createSetor(data);
        if (!newSetor) {
            throw new Error('Erro ao criar setor');
        }
        return {
            message: 'Setor criado com sucesso',
            setorId: newSetor.id
        };
    }
    
    async getAllSetores() {
        return this.setorModel.getAllSetores();
    }

    async getSetorById(id: string) {
        const setor = await this.setorModel.getSetorById(id);
        if (!setor) {
            throw new Error('Setor não encontrado');
        }
        return setor;
    }

    async deleteSetor(id: string) {
        const setorExistente = await this.setorModel.getSetorById(id);
        if (!setorExistente) {
            throw new Error('Setor não encontrado');
        }
        await this.setorModel.deleteSetor(id);

        return {
            message: 'Setor deletado com sucesso'
        };
    }

    async updateSetor(id: string, data: UpdateSetorInput) {
        const setorExistente = await this.setorModel.getSetorById(id);
        if (!setorExistente) {
            throw new Error('Setor não encontrado');
        }
        const updatedSetor = await this.setorModel.updateSetor(id, data);
        if (!updatedSetor) {
            throw new Error('Erro ao atualizar setor');
        }
        return {
            message: 'Setor atualizado com sucesso',
            setorId: updatedSetor.id
        };
    }
}