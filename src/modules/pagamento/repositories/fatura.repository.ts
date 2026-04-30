import { MetodoPagamento, Prisma, StatusPagamentoSocio } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import { CreateFaturaInput, UpdateFaturaInput } from "../types/pagamento.type";

export class FaturaRepository {
    constructor(private readonly prismaClient = prisma) { }

    async getAssinaturaById(id: string) {
        return this.prismaClient.assinatura.findUnique({ where: { id } });
    }

    async createFatura(data: CreateFaturaInput) {
        return this.prismaClient.fatura.create({
            data: {
                assinaturaId: data.assinaturaId,
                competencia: data.competencia,
                valor: Number(data.valor),
                status: data.status || "ABERTA",
                vencimentoEm: data.vencimentoEm,
                pagoEm: data.pagoEm || null,
                referencia: data.referencia || null,
            },
        });
    }

    async getAllFaturas() {
        return this.prismaClient.fatura.findMany();
    }

    async getFaturaById(id: string) {
        return this.prismaClient.fatura.findUnique({ where: { id }, include: { assinatura: true } });
    }

    async getFaturaParaBoleto(id: string) {
        return this.prismaClient.fatura.findUnique({
            where: { id },
            include: {
                assinatura: {
                    include: {
                        torcedor: true,
                        plano: { select: { nome: true } },
                    },
                },
            },
        });
    }

    async setReferencia(faturaId: string, referencia: string) {
        return this.prismaClient.fatura.update({
            where: { id: faturaId },
            data: { referencia },
        });
    }

    async criarPagamentoSocio(data: {
        torcedorId: string;
        faturaId: string;
        valor: number;
        status: StatusPagamentoSocio;
        dataVencimento: Date;
        referencia: string;
        metodo: MetodoPagamento;
        descricao: string;
        gatewayPaymentId: string;
    }) {
        return this.prismaClient.pagamentoSocio.create({ data });
    }

    async updateTorcedorGatewayClienteId(torcedorId: string, gatewayClienteId: string) {
        return this.prismaClient.torcedor.update({
            where: { id: torcedorId },
            data: { gatewayClienteId },
        });
    }

    async deleteFatura(id: string) {
        return this.prismaClient.fatura.delete({ where: { id } });
    }

    async updateFatura(id: string, data: UpdateFaturaInput) {
        return this.prismaClient.fatura.update({ where: { id }, data: data as Prisma.FaturaUpdateInput });
    }

    async getAssinaturaComTorcedor(id: string) {
        return this.prismaClient.assinatura.findUnique({
            where: { id },
            include: {
                torcedor: { select: { nome: true, email: true } },
                plano: { select: { nome: true, valor: true, periodicidade: true } },
            },
        });
    }
}
