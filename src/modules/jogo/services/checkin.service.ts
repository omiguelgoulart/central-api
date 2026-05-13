import { StatusIngresso } from "@prisma/client";

import { CheckinRepository } from "../repositories/checkin.repository";

export class CheckinService {
  constructor(private readonly repository = new CheckinRepository()) { }

  async checkin(ingressoId?: string, qrCode?: string, local?: string, feitoPor?: string) {
    const ingresso = await this.repository.getIngressoByIdOrQr(ingressoId, qrCode);

    if (!ingresso) {
      return {
        status: "INVALIDO",
        mensagem: "Ingresso nao encontrado.",
      };
    }

    const jogo = ingresso.itemPedido?.lote?.jogoSetor?.jogo
      ? {
        id: ingresso.itemPedido.lote.jogoSetor.jogo.id,
        nome: ingresso.itemPedido.lote.jogoSetor.jogo.nome,
        data: ingresso.itemPedido.lote.jogoSetor.jogo.data,
      }
      : undefined;

    if (ingresso.status === StatusIngresso.USADO) {
      return {
        status: "USADO",
        mensagem: "Este ingresso ja foi utilizado.",
        ingressoId: ingresso.id,
        jogo,
      };
    }

    if (
      ingresso.status === StatusIngresso.CANCELADO ||
      ingresso.status === StatusIngresso.EXPIRADO ||
      ingresso.status === StatusIngresso.ESTORNADO
    ) {
      return {
        status: "INVALIDO",
        mensagem: "Ingresso nao e valido para entrada.",
        ingressoId: ingresso.id,
        jogo,
      };
    }

    const atualizado = await this.repository.confirmarCheckin(ingresso.id, feitoPor, local);
    return {
      status: "VALIDO",
      mensagem: "Check-in realizado com sucesso.",
      ingressoId: atualizado.id,
      jogo,
    };
  }
}
