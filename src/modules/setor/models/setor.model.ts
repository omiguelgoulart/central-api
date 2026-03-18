import { prisma } from "../../../lib/prisma";
import { CreateSetorInput, UpdateSetorInput } from "../types/setor.type";
import { generateSlug } from "../utils/setor.util";

export class SetorModel {
    async createSetor(data: CreateSetorInput) {
        const slug = generateSlug(data.nome);
        return prisma.setor.create({
            data: {
                nome: data.nome,
                capacidade: data.capacidade,
                slug,
            },
        });
    }

    async getAllSetores() {
        return prisma.setor.findMany();
    }

    async getSetorById(id: string) {
        return prisma.setor.findUnique({
            where: { id },
        });
    }

    async deleteSetor(id: string) {
        return prisma.setor.delete({
            where: { id },
        });
    }

    async updateSetor(id: string, data: UpdateSetorInput) {
        const slug = data.nome ? generateSlug(data.nome) : undefined;
        return prisma.setor.update({
            where: { id },
            data: {
                nome: data.nome,
                capacidade: data.capacidade,
                slug,
            },
        });
    }
}
