import { prisma } from "../../../lib/prisma";
import { CreateSetorInput, UpdateSetorInput } from "../types/setor.type";
import { generateSlug } from "../utils/setor.util";

export class SetorRepository {

    constructor( private readonly prismaClient = prisma) {}
    async createSetor(data: CreateSetorInput) {
        const slug = generateSlug(data.nome);
        return this.prismaClient.setor.create({
            data: {
                nome: data.nome,
                capacidade: data.capacidade,
                slug,
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
        const slug = data.nome ? generateSlug(data.nome) : undefined;
        return this.prismaClient.setor.update({
            where: { id },
            data: {
                nome: data.nome,
                capacidade: data.capacidade,
                slug,
            },
        });
    }
}
