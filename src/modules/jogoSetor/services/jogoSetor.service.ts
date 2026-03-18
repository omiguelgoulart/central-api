import { JogoSetorModel } from "../models/jogoSetor.model";
import { CreateJogoSetorInput, UpdateJogoSetorInput } from "../types/jogoSetor.type";


export class JogoSetorService {
    private jogoSetorModel: JogoSetorModel;

    constructor() {
        this.jogoSetorModel = new JogoSetorModel();
    }

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