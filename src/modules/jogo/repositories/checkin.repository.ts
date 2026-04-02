import { StatusIngresso } from "@prisma/client";

import { prisma } from "../../../lib/prisma";

export class CheckinRepository {
  constructor(private readonly prismaClient = prisma) { }

  async getIngressoByIdOrQr(ingressoId?: string, qrCode?: string) {
    return this.prismaClient.ingresso.findUnique({
      where: ingressoId ? { id: ingressoId } : { qrCode: qrCode as string },
      include: { itemPedido: { include: { lote: { include: { jogoSetor: { include: { jogo: true } } } } } } },
    });
  }

  async confirmarCheckin(ingressoId: string, feitoPor?: string, local?: string) {
    const agora = new Date();
    const [ingressoAtualizado] = await this.prismaClient.$transaction([
      this.prismaClient.ingresso.update({
        where: { id: ingressoId },
        data: { status: StatusIngresso.USADO, usadoEm: agora },
      }),
      this.prismaClient.checkin.create({
        data: { ingressoId, feitoEm: agora, feitoPor, local },
      }),
    ]);

    return ingressoAtualizado;
  }
}
