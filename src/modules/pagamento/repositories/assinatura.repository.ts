import { Prisma, StatusFatura } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import { CreateAssinaturaInput, UpdateAssinaturaInput } from "../types/pagamento.type";

type FaturaInput = {
    competencia: string;
    valor: number;
    status: StatusFatura;
    vencimentoEm: Date;
};

export class AssinaturaRepository {
    constructor(private readonly prismaClient = prisma) { }

    async getTorcedorById(id: string) {
        return this.prismaClient.torcedor.findUnique({ where: { id } });
    }

    async getPlanoById(id: string) {
        return this.prismaClient.plano.findUnique({ where: { id } });
    }

    async createAssinatura(data: CreateAssinaturaInput, faturas: FaturaInput[]) {
        return this.prismaClient.$transaction(async (tx) => {
            const assinatura = await tx.assinatura.create({
                data: {
                    torcedorId: data.torcedorId,
                    planoId: data.planoId,
                    status: data.status,
                    inicioEm: new Date(data.inicioEm),
                    expiraEm: data.expiraEm ? new Date(data.expiraEm) : null,
                    proximaCobrancaEm: data.proximaCobrancaEm ? new Date(data.proximaCobrancaEm) : null,
                    periodicidade: "ANUAL",
                    valorAtual: faturas[0]?.valor ?? null,
                },
            });

            if (faturas.length > 0) {
                await tx.fatura.createMany({
                    data: faturas.map((f) => ({ ...f, assinaturaId: assinatura.id })),
                });
            }

            return assinatura;
        });
    }

    async getAllAssinaturas() {
        return this.prismaClient.assinatura.findMany({ include: { torcedor: true, plano: true } });
    }

    async getAssinaturaById(id: string) {
        return this.prismaClient.assinatura.findUnique({ where: { id } });
    }

    async getAssinaturaDetalheById(id: string) {
        return this.prismaClient.assinatura.findUnique({ where: { id }, include: { torcedor: true, plano: true } });
    }

    async deleteAssinatura(id: string) {
        return this.prismaClient.assinatura.delete({ where: { id } });
    }

    async updateAssinatura(id: string, data: UpdateAssinaturaInput) {
        const toDate = (value?: string) => (value ? new Date(value) : undefined);
        const toDateOrNull = (value?: string | null) => {
            if (value === null) return null;
            if (!value) return undefined;
            return new Date(value);
        };

        const parsedData: Prisma.AssinaturaUpdateInput = {
            status: data.status,
            inicioEm: toDate(data.inicioEm),
            expiraEm: toDateOrNull(data.expiraEm),
            proximaCobrancaEm: toDateOrNull(data.proximaCobrancaEm),
            canceladaEm: toDateOrNull(data.canceladaEm),
            suspensaEm: toDateOrNull(data.suspensaEm),
            retomadaEm: toDateOrNull(data.retomadaEm),
        };

        return this.prismaClient.assinatura.update({ where: { id }, data: parsedData });
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
