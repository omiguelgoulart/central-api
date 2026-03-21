import { JogoSetorRepository } from "../repositories/jogoSetor.repository";
import { CreateJogoSetorInput, UpdateJogoSetorInput } from "../types/jogoSetor.type";


export class JogoSetorService {
    
    constructor(private readonly jogoSetorModel: JogoSetorRepository) {}

    async createJogoSetor(data: CreateJogoSetorInput) {
        const newJogoSetor = await this.jogoSetorModel.createJogoSetor(data);
        return {
            message: 'JogoSetor criado com sucesso',
            jogoSetorId: newJogoSetor.id
        };
    }

    async getAllJogoSetores() {
        return this.jogoSetorModel.getAllJogoSetores();
    }

    async getJogoSetorById(id: string) {
        const jogoSetor = await this.jogoSetorModel.getJogoSetorById(id);
        if (!jogoSetor) {
            throw new Error('JogoSetor não encontrado');
        }
        return jogoSetor;
    }

    async deleteJogoSetor(id: string) {
        const jogoSetorExistente = await this.jogoSetorModel.getJogoSetorById(id);
        if (!jogoSetorExistente) {
            throw new Error('JogoSetor não encontrado');
        }
        await this.jogoSetorModel.deleteJogoSetor(id);

        return {
            message: 'JogoSetor deletado com sucesso'
        };
    }

    async updateJogoSetor(id: string, data: UpdateJogoSetorInput) {
        const jogoSetorExistente = await this.jogoSetorModel.getJogoSetorById(id);
        if (!jogoSetorExistente) {
            throw new Error('JogoSetor não encontrado');
        }
        await this.jogoSetorModel.updateJogoSetor(id, data);

        return {
            message: 'JogoSetor atualizado com sucesso'
        };
    }
}