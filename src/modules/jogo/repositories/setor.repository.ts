import { prisma } from "../../../lib/prisma";
import { CreateSetorInput, UpdateSetorInput } from "../types/setor.type";

export class SetorRepository {

    constructor(private readonly prismaClient = prisma) { }
    async createSetor(data: CreateSetorInput) {
        return this.prismaClient.setor.create({
            data: {
                slug: data.slug,
                nome: data.nome,
                tipo: (data.tipo || 'ARQUIBANCADA') as any,
            },
        });
    }

    async getAllSetores() {
        return this.prismaClient.setor.findMany();
    }

    async getSetorById(id: string) {
        return this.prismaClient.setor.findUnique({
            where: { id },
        });
    }

    async deleteSetor(id: string) {
        return this.prismaClient.setor.delete({
            where: { id },
        });
    }

    async updateSetor(id: string, data: UpdateSetorInput) {
        return this.prismaClient.setor.update({
            where: { id },
            data: {
                slug: data.slug,
                nome: data.nome,
                tipo: data.tipo as any,
            },
        });
    }
}
