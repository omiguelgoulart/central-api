import { prisma } from "../../../lib/prisma";
import { CreatePagamentoInput } from "../types/pagamento.type";

export class PagamentoRepository {
  constructor(private readonly prismaClient = prisma) { }

  async getTorcedorById(id: string) {
    return this.prismaClient.torcedor.findUnique({ where: { id } });
  }

  // Nota: O modelo 'pagamento' não existe mais no schema Prisma
  // Use pagamentoSocio ou pagamentoIngresso conforme necessário
  async createPagamento(data: CreatePagamentoInput) {
    return this.createPagamentoSocio(data);
  }

  async getAllPagamentos() {
    return this.prismaClient.pagamentoSocio.findMany();
  }

  async getPagamentoById(id: string) {
    return this.getPagamentoSocioById(id);
  }

  // Métodos para PagamentoSocio
  async createPagamentoSocio(data: any) {
    return this.prismaClient.pagamentoSocio.create({ data });
  }

  async getPagamentoSocioById(id: string) {
    return this.prismaClient.pagamentoSocio.findUnique({ where: { id } });
  }

  // Métodos para PagamentoIngresso
  async createPagamentoIngresso(data: any) {
    return this.prismaClient.pagamentoIngresso.create({ data });
  }

  async getPagamentoIngressoById(id: string) {
    return this.prismaClient.pagamentoIngresso.findUnique({ where: { id } });
  }
}
