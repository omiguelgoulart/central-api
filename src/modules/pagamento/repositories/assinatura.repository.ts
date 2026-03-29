import { prisma } from "../../../lib/prisma";
import { CreateAssinaturaInput, UpdateAssinaturaInput } from "../types/pagamento.type";

export class AssinaturaRepository {
    constructor(private readonly prismaClient = prisma) { }

    async getTorcedorById(id: string) {
        return this.prismaClient.torcedor.findUnique({ where: { id } });
    }

    async getPlanoById(id: string) {
        return this.prismaClient.plano.findUnique({ where: { id } });
    }

    async createAssinatura(data: CreateAssinaturaInput) {
        return this.prismaClient.assinatura.create({
            data: {
                torcedorId: data.torcedorId,
                planoId: data.planoId,
                status: data.status,
                inicioEm: new Date(data.inicioEm),
                expiraEm: data.expiraEm ? new Date(data.expiraEm) : null,
                proximaCobrancaEm: data.proximaCobrancaEm ? new Date(data.proximaCobrancaEm) : null,
            },
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
        const parsedData = { ...data } as any;
        if (parsedData.inicioEm) parsedData.inicioEm = new Date(parsedData.inicioEm);
        if (parsedData.fimEm) parsedData.fimEm = new Date(parsedData.fimEm);
        if (parsedData.proximaCobrancaEm) parsedData.proximaCobrancaEm = new Date(parsedData.proximaCobrancaEm);
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
