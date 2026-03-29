import { prisma } from "../../../lib/prisma";
import { CreatePagamentoInput } from "../types/pagamento.type";

export class PagamentoRepository {
  constructor(private readonly prismaClient = prisma) { }

  async getTorcedorById(id: string) {
    return this.prismaClient.torcedor.findUnique({ where: { id } });
  }

  async createPagamento(data: CreatePagamentoInput) {
    return this.prismaClient.pagamento.create({ data });
  }

  async getAllPagamentos() {
    return this.prismaClient.pagamento.findMany({
      include: {
        torcedor: { select: { nome: true } },
        ingressos: { select: { id: true } },
        pedidos: { select: { id: true } },
        fatura: {
          include: {
            assinatura: {
              include: { plano: { select: { nome: true } } },
            },
          },
        },
      },
      orderBy: { dataVencimento: "desc" },
    });
  }

  async getPagamentoById(id: string) {
    return this.prismaClient.pagamento.findUnique({ where: { id } });
  }
}
