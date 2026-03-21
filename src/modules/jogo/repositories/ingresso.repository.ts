import { prisma } from "../../../lib/prisma";
import { CreateIngressoInput } from "../types/ingresso.type";

export class IngressoRepository {
    constructor(private readonly prismaClient = prisma) { }

    async createJogo(data: CreateIngressoInput) {
        return this.prismaClient.ingresso.create({
            data: {
                torcedorId: data.torcedorId,
                jogoId: data.jogoId,
                loteId: data.loteId ?? null,
                qrCode: data.qrCode || "",
                valor: data.valor,
                status: data.status,
            },
        });
    }

    async getAllIngressos() {
        return this.prismaClient.ingresso.findMany();
    }

    async getIngressoById(id: string) {
        return this.prismaClient.ingresso.findUnique({
            where: { id },
        });
    }

    async getIngressosByJogoId(jogoId: string) {
        return this.prismaClient.ingresso.findMany({
            where: { jogoId },
        });
    }

    async getIngressoQrCode(id: string) {
        return this.prismaClient.ingresso.findUnique({
            where: { id },
            select: { id: true, qrCode: true },
        });
    }

    async deleteIngresso(id: string) {
        return this.prismaClient.ingresso.delete({
            where: { id },
        });
    }

    async updateIngresso(id: string, data: Partial<CreateIngressoInput>) {
        return this.prismaClient.ingresso.update({
            where: { id },
            data: {
                torcedorId: data.torcedorId,
                jogoId: data.jogoId,
                loteId: data.loteId ?? null,
                qrCode: data.qrCode,
                valor: data.valor,
                status: data.status,
            },
        });
    }

    async updateIngressoStatus(id: string, status: "VALIDO" | "USADO" | "CANCELADO") {
        return this.prismaClient.ingresso.update({
            where: { id },
            data: { status },
        });
    }
}
