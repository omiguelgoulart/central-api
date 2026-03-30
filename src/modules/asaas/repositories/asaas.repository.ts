import { StatusPagamento } from "@prisma/client";
import axios from "axios";

import { prisma } from "../../../lib/prisma";
import { AsaasPayment, AsaasPixQrCode } from "../../../types/asaas";
import { asaas } from "../libs/asaas.lib";

export interface CriarPagamentoBase {
  customerId: string;
  valor: number;
  descricao: string;
  dueDate?: string;
}

export interface CriarPagamentoPix extends CriarPagamentoBase {
  tipo: "PIX";
}

export interface CriarPagamentoBoleto extends CriarPagamentoBase {
  tipo: "BOLETO";
}

export interface CartaoInfo {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface PortadorInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface CriarPagamentoCredito extends CriarPagamentoBase {
  tipo: "CREDIT_CARD";
  cartao: CartaoInfo;
  portador: PortadorInfo;
  ip?: string;
  installmentCount?: number;
  capture?: boolean;
}

export interface CriarPagamentoDebito extends CriarPagamentoBase {
  tipo: "DEBIT_CARD";
  cartao: CartaoInfo;
  portador: PortadorInfo;
  ip?: string;
}

export type CriarPagamentoParams =
  | CriarPagamentoPix
  | CriarPagamentoBoleto
  | CriarPagamentoCredito
  | CriarPagamentoDebito;

const toYmd = (daysFromNow = 1): string =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

const cleanDigits = (v?: string) => (v ?? "").replace(/\D/g, "");

function buildCreditCardPayload(cartao: CartaoInfo) {
  return {
    holderName: cartao.holderName,
    number: cartao.number,
    expiryMonth: cartao.expiryMonth,
    expiryYear: cartao.expiryYear,
    ccv: cartao.ccv,
  };
}

function buildHolderInfoPayload(portador: PortadorInfo) {
  return {
    name: portador.name,
    email: portador.email,
    cpfCnpj: cleanDigits(portador.cpfCnpj),
    postalCode: cleanDigits(portador.postalCode),
    addressNumber: cleanDigits(portador.addressNumber),
    phone: cleanDigits(portador.phone),
  };
}

type AsaasHttpClient = Pick<typeof asaas, "get" | "post">;
type PrismaClientLike = typeof prisma;
type HttpClient = Pick<typeof axios, "get">;

export class AsaasRepository {
  constructor(
    private readonly asaasClient: AsaasHttpClient = asaas,
    private readonly prismaClient: PrismaClientLike = prisma,
    private readonly httpClient: HttpClient = axios
  ) { }

  async criarCliente(params: { nome: string; email: string; cpfCnpj?: string }) {
    const payload: Record<string, unknown> = { name: params.nome, email: params.email };
    if (params.cpfCnpj) payload.cpfCnpj = cleanDigits(params.cpfCnpj);
    const { data } = await this.asaasClient.post<Record<string, unknown>>("/customers", payload);
    return data;
  }

  async criarPagamento(params: CriarPagamentoParams) {
    switch (params.tipo) {
      case "PIX":
        return this.criarPagamentoPix(params);
      case "BOLETO":
        return this.criarPagamentoBoleto(params);
      case "CREDIT_CARD":
        return this.criarPagamentoCredito(params);
      case "DEBIT_CARD":
        return this.criarPagamentoDebito(params);
    }
  }

  private async criarPagamentoPix(p: CriarPagamentoPix): Promise<AsaasPayment> {
    const payload = {
      customer: p.customerId,
      value: p.valor,
      billingType: "PIX" as const,
      description: p.descricao,
      dueDate: p.dueDate ?? toYmd(1),
    };
    const { data } = await this.asaasClient.post<AsaasPayment>("/payments", payload);
    return data;
  }

  private async criarPagamentoBoleto(p: CriarPagamentoBoleto): Promise<AsaasPayment> {
    const payload = {
      customer: p.customerId,
      value: p.valor,
      billingType: "BOLETO" as const,
      description: p.descricao,
      dueDate: p.dueDate ?? toYmd(3),
    };
    const { data } = await this.asaasClient.post<AsaasPayment>("/payments", payload);
    return data;
  }

  private async criarPagamentoCredito(p: CriarPagamentoCredito): Promise<AsaasPayment> {
    const payload: Record<string, unknown> = {
      customer: p.customerId,
      value: p.valor,
      billingType: "CREDIT_CARD" as const,
      description: p.descricao,
      creditCard: buildCreditCardPayload(p.cartao),
      creditCardHolderInfo: buildHolderInfoPayload(p.portador),
      remoteIp: p.ip,
    };
    if (typeof p.capture === "boolean") payload.capture = p.capture;
    if (p.installmentCount && p.installmentCount > 1) payload.installmentCount = p.installmentCount;
    const { data } = await this.asaasClient.post<AsaasPayment>("/payments", payload);
    return data;
  }

  private async criarPagamentoDebito(p: CriarPagamentoDebito): Promise<AsaasPayment> {
    const payload: Record<string, unknown> = {
      customer: p.customerId,
      value: p.valor,
      billingType: "DEBIT_CARD" as const,
      description: p.descricao,
      debitCard: buildCreditCardPayload(p.cartao),
      creditCardHolderInfo: buildHolderInfoPayload(p.portador),
      remoteIp: p.ip,
    };
    const { data } = await this.asaasClient.post<AsaasPayment>("/payments", payload);
    return data;
  }

  async obterQrCodePix(paymentId: string): Promise<AsaasPixQrCode> {
    const { data } = await this.asaasClient.get<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
    return data;
  }

  async obterStatusPagamento(paymentId: string) {
    const { data } = await this.asaasClient.get<AsaasPayment>(`/payments/${paymentId}`);
    const paymentDetails = data as AsaasPayment & {
      confirmedDate?: string;
      paymentDate?: string;
    };
    return {
      id: data.id,
      status: data.status,
      billingType: data.billingType,
      value: data.value,
      customer: data.customer,
      description: data.description,
      dueDate: data.dueDate,
      confirmedDate: paymentDetails.confirmedDate,
      paymentDate: paymentDetails.paymentDate,
    };
  }

  async obterBoletoPdf(paymentId: string): Promise<Buffer> {
    const boletoConfig = {
      maxRedirects: 0,
      validateStatus: (status: number) => status >= 200 && status < 400,
    };
    const response = await this.asaasClient.get(`/payments/${paymentId}/boleto`, boletoConfig);

    const pdfUrl = response.headers["location"];
    if (!pdfUrl) throw new Error("BOLETO_PDF_URL_NOT_FOUND");

    const pdfResponse = await this.httpClient.get<ArrayBuffer>(pdfUrl, { responseType: "arraybuffer" });
    return Buffer.from(pdfResponse.data);
  }

  async getLoteById(id: string) {
    return this.prismaClient.lote.findUnique({ where: { id } });
  }

  async getFaturaById(id: string) {
    return this.prismaClient.fatura.findUnique({ where: { id } });
  }

  async atualizarPagamentoWebhook(gatewayPaymentId: string, status: StatusPagamento, pagoEm: Date | null) {
    return this.prismaClient.pagamento.updateMany({ where: { gatewayPaymentId }, data: { status, pagoEm } });
  }

  async getPagamentoComTorcedor(gatewayPaymentId: string) {
    return this.prismaClient.pagamento.findFirst({
      where: { gatewayPaymentId },
      include: { torcedor: { select: { nome: true, email: true } } },
    });
  }
}
