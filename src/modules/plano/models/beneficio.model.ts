import { prisma } from "@/lib/prisma";

type CreateBeneficioData = {
  slug: string;
  titulo: string;
    descricao?: string;
    icone?: string;
    ativo?: boolean;
    planoId: string;
    destaque?: boolean;
    observacao?: string;
};

type UpdateBeneficioData = Partial<CreateBeneficioData>;

export class BeneficioModel {
    async createBeneficio(data: CreateBeneficioData) {
        return prisma.beneficio.create({
            data: {
                slug: data.slug,
                titulo: data.titulo,
                descricao: data.descricao,
                icone: data.icone,
                ativo: data.ativo ?? true,
                planoId: data.planoId,
                destaque: data.destaque ?? false,
                observacao: data.observacao,
            },
        });
    }

    async getBeneficio () {
        return prisma.beneficio.findMany({
            orderBy: { ordem: "asc" },
        });
    }

    async getBeneficioById(id: string) {
        return prisma.beneficio.findUnique({
            where: { id },
        });
    }

    async deleteBeneficio(id: string) {
        return prisma.beneficio.delete({
            where: { id },
        });
    }

    async updateBeneficio(id: string, data: UpdateBeneficioData) {
        return prisma.beneficio.update({
            where: { id },
            data: {
                slug: data.slug,
                titulo: data.titulo,
                descricao: data.descricao,
                icone: data.icone,
                ativo: data.ativo,
                destaque: data.destaque,
                observacao: data.observacao,
            },
        });
    }

    async getBeneficioBySlug(slug: string) {
        return prisma.beneficio.findUnique({
            where: { slug },
        });
    }
}