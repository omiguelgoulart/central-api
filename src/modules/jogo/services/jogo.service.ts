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

    async getJogoFull(id: string) {
        const jogo = await this.jogoModel.getJogoFull(id);
        if (!jogo) {
            throw new Error('Jogo não encontrado');
        }

        const ingressos = jogo.lotes.flatMap((lote) =>
            lote.itensPedido
                .filter((item) => item.ingresso)
                .map((item) => ({
                    id: item.ingresso!.id,
                    valor: item.valorUnitario,
                    status: item.ingresso!.status,
                    socio: item.pedido.torcedor
                        ? { nome: item.pedido.torcedor.nome }
                        : null,
                    checkins: item.ingresso!.checkins,
                }))
        );

        return {
            id: jogo.id,
            nome: jogo.nome,
            data: jogo.data,
            local: jogo.local,
            descricao: jogo.descricao,
            ingressos,
        };
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