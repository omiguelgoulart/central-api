import { StatusIngresso } from "@prisma/client";

import { CheckinRepository } from "../repositories/checkin.repository";

export class CheckinService {
  constructor(private readonly repository = new CheckinRepository()) {}

  async checkin(ingressoId?: string, qrCode?: string, local?: string, feitoPor?: string) {
    const ingresso = await this.repository.getIngressoByIdOrQr(ingressoId, qrCode);

    if (!ingresso) {
      return {
        status: "INVALIDO",
        mensagem: "Ingresso nao encontrado.",
      };
    }

    const jogo = ingresso.jogo
      ? {
          id: ingresso.jogo.id,
          nome: ingresso.jogo.nome,
          data: ingresso.jogo.data,
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
      ingresso.status === StatusIngresso.ESTORNADO ||
      ingresso.status === StatusIngresso.PENDENTE
    ) {
      const motivo =
        ingresso.status === StatusIngresso.PENDENTE
          ? "Pagamento ainda nao confirmado para este ingresso."
          : "Ingresso nao e valido para entrada.";

      return {
        status: "INVALIDO",
        mensagem: motivo,
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
