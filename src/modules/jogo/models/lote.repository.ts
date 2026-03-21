import { prisma } from "../../../lib/prisma";

type TipoLote = "INTEIRA" | "MEIA" | "CORTESIA" | "PROMO";

export interface CreateLoteInput {
  nome: string;
  tipo: TipoLote;
  quantidade: number;
  precoUnitario: number;
  inicioVendas: string;
  fimVendas: string;
  limitePorCPF: number;
  jogoId: string;
  jogoSetorId: string;
}

export class LoteRepository {
  constructor(private readonly prismaClient = prisma) {}

  async createLote(data: CreateLoteInput) {
    return this.prismaClient.lote.create({
      data: {
        nome: data.nome,
        tipo: data.tipo,
        quantidade: data.quantidade,
        precoUnitario: data.precoUnitario,
        inicioVendas: data.inicioVendas ? new Date(data.inicioVendas) : undefined,
        fimVendas: data.fimVendas ? new Date(data.fimVendas) : undefined,
        limitePorCPF: data.limitePorCPF,
        jogoId: data.jogoId,
        jogoSetorId: data.jogoSetorId,
      },
    });
  }

  async getAllLotes() {
    return this.prismaClient.lote.findMany();
  }

  async getLoteById(id: string) {
    return this.prismaClient.lote.findUnique({
      where: { id },
    });
  }

  async deleteLote(id: string) {
    return this.prismaClient.lote.delete({
      where: { id },
    });
  }

  async updateLote(id: string, data: Partial<CreateLoteInput>) {
    return this.prismaClient.lote.update({
      where: { id },
      data: {
        nome: data.nome,
        tipo: data.tipo,
        quantidade: data.quantidade,
        precoUnitario: data.precoUnitario,
        inicioVendas: data.inicioVendas ? new Date(data.inicioVendas) : undefined,
        fimVendas: data.fimVendas ? new Date(data.fimVendas) : undefined,
        limitePorCPF: data.limitePorCPF,
        jogoId: data.jogoId,
        jogoSetorId: data.jogoSetorId,
      },
    });
  }
}