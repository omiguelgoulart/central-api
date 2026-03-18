import { prisma } from "../../../lib/prisma";
import { CreateJogoInput, UpdateJogoInput } from "../types/jogo.type";

export class JogoModel {
    async createJogo(data: CreateJogoInput) {
        return prisma.jogo.create({
            data: {
                nome: data.nome,
                data: new Date(data.data),
                local: data.local,
                descricao: data.descricao,
            },
        });
    }

    async getAllJogos() {
        return prisma.jogo.findMany({
            orderBy: {
                data: "asc",
            },
        });
    }

    async getJogoById(id: string) {
        return prisma.jogo.findUnique({
            where: { id },
        });
    }

    async deleteJogo(id: string) {
        return prisma.jogo.delete({
            where: { id },
        });
    }

    async updateJogo(id: string, data: UpdateJogoInput) {
        return prisma.jogo.update({
            where: { id },
            data: {
                nome: data.nome,
                data: data.data ? new Date(data.data) : undefined,
                local: data.local,
                descricao: data.descricao,
            },
        });
    }

}
