import { StatusPagamentoSocio } from "@prisma/client";

import {
  pagamentoAtrasadoTemplate,
} from "../../emails/email-templates/pagamento-atrasado.template";
import {
  pagamentoConfirmadoTemplate,
} from "../../emails/email-templates/pagamento-confirmado.template";
import { sendEmail } from "../../emails/services/email.service";
import { AsaasRepository, CriarPagamentoBoleto, CriarPagamentoCredito, CriarPagamentoDebito, CriarPagamentoPix } from "../repositories/asaas.repository";
import { CriarClienteInput, CriarPagamentoInput } from "../types/asaas.type";

type AsaasWebhookEvent = {
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    confirmedDate?: string;
  };
};

export class AsaasService {
  constructor(private readonly asaasRepository = new AsaasRepository()) { }

  async criarCliente(data: CriarClienteInput) {
    return this.asaasRepository.criarCliente(data);
  }

  async criarPagamento(data: CriarPagamentoInput, ip?: string) {
    let valorReal: number | undefined;

    if (data.loteId) {
      const lote = await this.asaasRepository.getLoteById(data.loteId);
      if (!lote) throw new Error("Lote nao encontrado");
      valorReal = Number(lote.precoUnitario);
    } else if (data.faturaId) {
      const fatura = await this.asaasRepository.getFaturaById(data.faturaId);
      if (!fatura) throw new Error("Fatura nao encontrada");
      valorReal = Number(fatura.valor);
    }

    if (!valorReal && !data.valor) {
      throw new Error("Informe loteId ou faturaId para calcular o valor");
    }

    const valorFinal = valorReal ?? data.valor;
    const payload = { ...data, valor: valorFinal };
    delete payload.loteId;
    delete payload.faturaId;

    switch (payload.tipo) {
      case "PIX":
        return this.asaasRepository.criarPagamento(payload as CriarPagamentoPix);
      case "BOLETO":
        return this.asaasRepository.criarPagamento(payload as CriarPagamentoBoleto);
      case "CREDIT_CARD":
        return this.asaasRepository.criarPagamento({ ...payload, ip } as CriarPagamentoCredito);
      case "DEBIT_CARD":
        return this.asaasRepository.criarPagamento({ ...payload, ip } as CriarPagamentoDebito);
    }
  }

  async obterQrCodePix(paymentId: string) {
    return this.asaasRepository.obterQrCodePix(paymentId);
  }

  async obterStatusPagamento(id: string) {
    return this.asaasRepository.obterStatusPagamento(id);
  }

  async obterBoletoPdf(id: string) {
    return this.asaasRepository.obterBoletoPdf(id);
  }

  async tokenizeCard(params: { customerId: string; cartao: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string }; portador: { name: string; email: string; cpfCnpj: string; postalCode: string; addressNumber: string; phone: string } }) {
    return this.asaasRepository.tokenizeCard(params);
  }

  async processarWebhook(rawEvento: unknown) {
    const evento = rawEvento as AsaasWebhookEvent;
    if (!evento?.event) throw new Error("Evento invalido");
    if (!(evento.event.startsWith("PAYMENT_") && evento.payment?.id)) return;

    const novoStatus = this.mapStatus(evento.payment.status ?? "");
    const pagoEm =
      novoStatus === StatusPagamentoSocio.PAGO && evento.payment.confirmedDate
        ? new Date(evento.payment.confirmedDate)
        : novoStatus === StatusPagamentoSocio.PAGO
          ? new Date()
          : null;

    const resultado = await this.asaasRepository.atualizarPagamentoWebhook(evento.payment.id, novoStatus, pagoEm);
    if (resultado.count <= 0) return;

    if (novoStatus === StatusPagamentoSocio.PAGO) {
      await this.asaasRepository.marcarFaturasPagas(evento.payment.id, pagoEm ?? new Date());
    }

    const pagamentoDb = await this.asaasRepository.getPagamentoComTorcedor(evento.payment.id);
    if (!pagamentoDb?.torcedor?.email) return;

    const { nome, email } = pagamentoDb.torcedor;
    if (novoStatus === StatusPagamentoSocio.PAGO) {
      const html = pagamentoConfirmadoTemplate({
        nome,
        valor: Number(pagamentoDb.valor),
        descricao: pagamentoDb.descricao ?? "Pagamento",
        metodo: pagamentoDb.metodo,
        dataConfirmacao: new Date().toLocaleDateString("pt-BR"),
        referencia: pagamentoDb.referencia ?? undefined,
      });
      sendEmail({
        to: email,
        subject: "Pagamento Confirmado!",
        html,
      }).catch((err) => console.error("Erro email pgto confirmado:", err));
    } else if (novoStatus === StatusPagamentoSocio.ATRASADO) {
      const html = pagamentoAtrasadoTemplate({
        nome,
        valor: Number(pagamentoDb.valor),
        descricao: pagamentoDb.descricao ?? "Pagamento",
        dataVencimento: pagamentoDb.dataVencimento.toLocaleDateString("pt-BR"),
      });
      sendEmail({
        to: email,
        subject: "Pagamento em Atraso",
        html,
      }).catch((err) => console.error("Erro email pgto atrasado:", err));
    }
  }

  private mapStatus(status: string): StatusPagamentoSocio {
    switch (status) {
      case "CONFIRMED":
      case "RECEIVED":
      case "RECEIVED_IN_CASH":
        return StatusPagamentoSocio.PAGO;
      case "OVERDUE":
        return StatusPagamentoSocio.ATRASADO;
      case "CANCELED":
        return StatusPagamentoSocio.CANCELADO;
      default:
        return StatusPagamentoSocio.PENDENTE;
    }
  }
}
