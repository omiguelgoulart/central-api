import { prisma } from "../../../lib/prisma";
import { CreatePlanoInput, UpdatePlanoInput } from "../types/plano.type";


export class PlanoRepository {
    constructor(private readonly prismaClient = prisma) { }

    async createPlano(data: CreatePlanoInput) {
        return this.prismaClient.plano.create({
            data: {
                nome: data.nome,
                valor: data.valor,
                periodicidade: data.Periodicidade,
            },
        });
    }

    async getAllPlanos() {
        return this.prismaClient.plano.findMany();
    }

    async getPlanoById(id: string) {
        return this.prismaClient.plano.findUnique({
            where: { id },
        });
    }

    async deletePlano(id: string) {
        return this.prismaClient.plano.delete({
            where: { id },
        });
    }

    async updatePlano(id: string, data: UpdatePlanoInput) {
        return this.prismaClient.plano.update({
            where: { id },
            data: {
                nome: data.nome,
                valor: data.valor,
                periodicidade: data.Periodicidade,
            },
        });
    }
}