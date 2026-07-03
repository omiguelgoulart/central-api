import { prisma } from "../../../lib/prisma";
import { CreateJogoInput, UpdateJogoInput } from "../types/jogo.type";

export class JogoRepository {
    constructor(private readonly prismaClient = prisma) { }

    async createJogo(data: CreateJogoInput) {
        return this.prismaClient.jogo.create({
            data: {
                nome: data.nome,
                data: new Date(data.data),
                local: data.local,
                descricao: data.descricao,
            },
        });
    }

    async getAllJogos() {
        return this.prismaClient.jogo.findMany({
            orderBy: {
                data: "asc",
            },
        });
    }

    async getProximosJogos(limit = 5) {
        return this.prismaClient.jogo.findMany({
            where: {
                data: {
                    gte: new Date(),
                },
            },
            orderBy: {
                data: "asc",
            },
            take: limit,
        });
    }

    async getJogoById(id: string) {
        return this.prismaClient.jogo.findUnique({
            where: { id },
            include: {
                setores: {
                    include: {
                        setor: true,
                    },
                },
                lotes: true,
            },
        });
    }

    async getJogoFull(id: string) {
        return this.prismaClient.jogo.findUnique({
            where: { id },
            include: {
                lotes: {
                    include: {
                        itensPedido: {
                            include: {
                                pedido: {
                                    include: {
                                        torcedor: true,
                                    },
                                },
                                ingresso: {
                                    include: {
                                        checkins: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async deleteJogo(id: string) {
        return this.prismaClient.jogo.delete({
            where: { id },
        });
    }

    async updateJogo(id: string, data: UpdateJogoInput) {
        return this.prismaClient.jogo.update({
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
