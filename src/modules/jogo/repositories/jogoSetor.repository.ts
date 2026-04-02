import { prisma } from "../../../lib/prisma";
import { CreateJogoSetorInput, UpdateJogoSetorInput } from "../types/jogoSetor.type";

export class JogoSetorRepository {
    constructor(private readonly prismaClient = prisma) { }

    async createJogoSetor(data: CreateJogoSetorInput) {
        return this.prismaClient.jogoSetor.create({
            data: {
                jogoId: data.jogoId,
                setorId: data.setorId,
                capacidade: data.capacidade,
                aberto: data.aberto ?? true,
            },
        });
    }

    async getAllJogoSetores() {
        return this.prismaClient.jogoSetor.findMany();
    }

    async getJogoSetorById(id: string) {
        return this.prismaClient.jogoSetor.findUnique({
            where: { id },
        });
    }

    async deleteJogoSetor(id: string) {
        return this.prismaClient.jogoSetor.delete({
            where: { id },
        });
    }

    async updateJogoSetor(id: string, data: UpdateJogoSetorInput) {
        return this.prismaClient.jogoSetor.update({
            where: { id },
            data: {
                jogoId: data.jogoId,
                setorId: data.setorId,
                capacidade: data.capacidade,
                aberto: data.aberto,
            },
        });
    }
}
