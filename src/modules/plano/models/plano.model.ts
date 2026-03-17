import { prisma } from "@/lib/prisma";
import { PeriodicidadePlano } from "../types/plano.type";

type CreatePlanoData = {
  nome: string;
  valor: number;
  Periodicidade: PeriodicidadePlano;
  descricao: string;
};

type UpdatePlanoData = Partial<CreatePlanoData>;

export class PlanoModel {
  async createPlano(data: CreatePlanoData) {
    return prisma.plano.create({
      data: {
        nome: data.nome,
        valor: data.valor,
        periodicidade: data.Periodicidade,
        descricao: data.descricao,
      },
    });
  }

  async getAllPlanos() {
    return prisma.plano.findMany({
      include: {
        beneficios: true,
      },
      orderBy: {
        valor: "asc",
      },
    });
  }

  async getPlanoById(id: string) {
    return prisma.plano.findUnique({
      where: { id },
      include: {
        beneficios: true,
      },
    });
  }

  async getPlanoByNome(nome: string) {
    return prisma.plano.findUnique({
      where: { nome },
    });
  }

  async deletePlano(id: string) {
    return prisma.plano.delete({
      where: { id },
    });
  }

  async updatePlano(id: string, data: UpdatePlanoData) {
    return prisma.plano.update({
      where: { id },
      data: {
        nome: data.nome,
        valor: data.valor,
        periodicidade: data.Periodicidade,
        descricao: data.descricao,
      },
    });
  }
}