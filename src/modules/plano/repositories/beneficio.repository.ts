import { prisma } from "../../../lib/prisma";
import { CreateBeneficioInput, UpdateBeneficioInput } from "../types/beneficio.type";

export class BeneficioRepository {
  constructor(private readonly prismaClient = prisma) {}

    async createBeneficio(data: CreateBeneficioInput) {
        return this.prismaClient.beneficio.create({
            data: {
                slug: data.slug,
                titulo: data.titulo,
                descricao: data.descricao,
                planoId: data.planoId,
            },
        });
    }

    async getAllBeneficios() {
        return this.prismaClient.beneficio.findMany();
    }

    async getBeneficioById(id: string) {
        return this.prismaClient.beneficio.findUnique({
            where: { id },
        });
    }

    async deleteBeneficio(id: string) {
        return this.prismaClient.beneficio.delete({
            where: { id },
        });
    }

    async updateBeneficio(id: string, data: UpdateBeneficioInput) {
        return this.prismaClient.beneficio.update({
            where: { id },
            data: {
                slug: data.slug,
                titulo: data.titulo,
                descricao: data.descricao,
                planoId: data.planoId,
            },
        });
    }
    
}
