import { prisma } from "../../../lib/prisma";
import { CreateJogoSetorInput, UpdateJogoSetorInput, TipoSetor } from "../types/jogoSetor.type";

export class JogoSetorModel {
    async createJogoSetor(data: CreateJogoSetorInput) {
        return prisma.jogoSetor.create({
            data: {
                jogoId: data.jogoId,
                setorId: data.setorId,
                capacidade: data.capacidade,
                aberto: data.aberto,
                tipo: data.tipo,
            },
        });
    }

    async getAllJogoSetores() {
        return prisma.jogoSetor.findMany();
    }

    async getJogoSetorById(id: string) {
        return prisma.jogoSetor.findUnique({
            where: { id },
        });
    }

    async deleteJogoSetor(id: string) {
        return prisma.jogoSetor.delete({
            where: { id },
        });
    }

    async updateJogoSetor(id: string, data: UpdateJogoSetorInput) {
        return prisma.jogoSetor.update({
            where: { id },
            data: {
                capacidade: data.capacidade,
                aberto: data.aberto,
                tipo: data.tipo,
            },
        });
    }

    async getSetoresByJogoId(jogoId: string) {
        return prisma.jogoSetor.findMany({
            where: { jogoId },
            include: {
                setor: true,
            },
        });
    }
}
