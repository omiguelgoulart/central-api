import { JogoRepository } from "../repositories/jogo.repository";
import { CreateJogoInput, UpdateJogoInput } from "../types/jogo.type";


export class JogoService {
    constructor(private readonly jogoModel: JogoRepository) {}

    async createJogo(data: CreateJogoInput) {
        const newJogo = await this.jogoModel.createJogo(data);
        return {
            message: 'Jogo criado com sucesso',
            jogoId: newJogo.id
        };
    }

    async getAllJogos() {
        return this.jogoModel.getAllJogos();
    }

    async getProximosJogos(limit = 5) {
        return this.jogoModel.getProximosJogos(limit);
    }

    async getJogoById(id: string) {
        const jogo = await this.jogoModel.getJogoById(id);
        if (!jogo) {
            throw new Error('Jogo não encontrado');
        }
        return jogo;
    }

    async deleteJogo(id: string) {
        const jogoExistente = await this.jogoModel.getJogoById(id);
        if (!jogoExistente) {
            throw new Error('Jogo não encontrado');
        }
        await this.jogoModel.deleteJogo(id);

        return {
            message: 'Jogo deletado com sucesso'
        };
    }

    async updateJogo(id: string, data: UpdateJogoInput) {
        const jogoExistente = await this.jogoModel.getJogoById(id);
        if (!jogoExistente) {
            throw new Error('Jogo não encontrado');
        }
        await this.jogoModel.updateJogo(id, data);

        return {
            message: 'Jogo atualizado com sucesso'
        };
    }

}