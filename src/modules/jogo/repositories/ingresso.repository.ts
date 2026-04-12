import { prisma } from "../../../lib/prisma";
import { CreateIngressoInput } from "../types/ingresso.type";

export class IngressoRepository {
    constructor(private readonly prismaClient = prisma) { }

    async createIngresso(data: CreateIngressoInput) {
        return this.prismaClient.ingresso.create({
            data: {
                itemPedidoId: data.itemPedidoId as any,
                qrCode: data.qrCode,
                status: data.status || "VALIDO",
                usadoEm: data.usadoEm || null,
            },
        });
    }

    async getAllIngressos() {
        return this.prismaClient.ingresso.findMany();
    }

    async getIngressoById(id: string) {
        return this.prismaClient.ingresso.findUnique({
            where: { id },
            include: {
                itemPedido: {
                    include: {
                        pedido: {
                            include: {
                                pagamento: true,
                            },
                        },
                        lote: {
                            include: {
                                jogo: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async getIngressoByQrCode(qrCode: string) {
        return this.prismaClient.ingresso.findUnique({
            where: { qrCode },
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
                qrCode: data.qrCode,
                status: data.status,
                usadoEm: data.usadoEm,
            },
        });
    }

    async updateIngressoStatus(id: string, status: "VALIDO" | "USADO" | "CANCELADO" | "EXPIRADO" | "ESTORNADO") {
        return this.prismaClient.ingresso.update({
            where: { id },
            data: { status },
        });
    }
}
