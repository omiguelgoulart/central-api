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

    async getFaturasParaConfirmacao(ids: string[]) {
        return this.prismaClient.fatura.findMany({
            where: { id: { in: ids } },
            include: {
                assinatura: {
                    include: {
                        torcedor: { select: { id: true } },
                        plano: { select: { nome: true } },
                    },
                },
            },
        });
    }

    async confirmarPagamentoFaturas(params: {
        faturaIds: string[];
        torcedorId: string;
        gatewayPaymentId: string;
        metodo: MetodoPagamento;
        pagoEm: Date;
    }) {
        return this.prismaClient.$transaction(async (tx) => {
            const faturas = await tx.fatura.findMany({
                where: {
                    id: { in: params.faturaIds },
                    assinatura: { torcedorId: params.torcedorId },
                },
                include: {
                    assinatura: {
                        include: {
                            plano: { select: { nome: true } },
                        },
                    },
                },
            });

            for (const [index, fatura] of faturas.entries()) {
                await tx.fatura.update({
                    where: { id: fatura.id },
                    data: {
                        status: "PAGA",
                        pagoEm: params.pagoEm,
                        metodo: params.metodo,
                    },
                });

                const pagamentoExistente = await tx.pagamentoSocio.findFirst({
                    where: {
                        faturaId: fatura.id,
                        gatewayPaymentId: params.gatewayPaymentId,
                    },
                });

                if (pagamentoExistente) {
                    await tx.pagamentoSocio.update({
                        where: { id: pagamentoExistente.id },
                        data: {
                            status: "PAGO",
                            pagoEm: params.pagoEm,
                            metodo: params.metodo,
                        },
                    });
                    continue;
                }

                await tx.pagamentoSocio.create({
                    data: {
                        torcedorId: params.torcedorId,
                        faturaId: fatura.id,
                        valor: Number(fatura.valor),
                        status: "PAGO",
                        dataVencimento: fatura.vencimentoEm,
                        pagoEm: params.pagoEm,
                        referencia: `${params.gatewayPaymentId}-${index}`,
                        metodo: params.metodo,
                        descricao: `${fatura.assinatura.plano.nome} - ${fatura.competencia}`,
                        gatewayPaymentId: params.gatewayPaymentId,
                    },
                });
            }

            return { count: faturas.length };
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
