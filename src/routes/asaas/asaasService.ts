import { asaas } from "../../lib/asaas";

export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD";
import { AsaasPayment, AsaasPixQrCode } from "../../types/asaas";

// ------------------------ modelos ------------------------

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

// ------------------------ helpers ------------------------

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

// ------------------------ builders por método ------------------------

// PIX
export async function criarPagamentoPix(p: CriarPagamentoPix): Promise<AsaasPayment> {
  const payload = {
    customer: p.customerId,
    value: p.valor,
    billingType: "PIX" as const,
    description: p.descricao,
    dueDate: p.dueDate ?? toYmd(1),
  };
  const { data } = await asaas.post<AsaasPayment>("/payments", payload);
  return data;
}

// BOLETO
export async function criarPagamentoBoleto(p: CriarPagamentoBoleto): Promise<AsaasPayment> {
  const payload = {
    customer: p.customerId,
    value: p.valor,
    billingType: "BOLETO" as const,
    description: p.descricao,
    dueDate: p.dueDate ?? toYmd(3),
  };
  const { data } = await asaas.post<AsaasPayment>("/payments", payload);
  return data;
}

// CRÉDITO
export async function criarPagamentoCredito(p: CriarPagamentoCredito): Promise<AsaasPayment> {
  const payload: any = {
    customer: p.customerId,
    value: p.valor,
    billingType: "CREDIT_CARD" as const,
    description: p.descricao,
    creditCard: buildCreditCardPayload(p.cartao),
    creditCardHolderInfo: buildHolderInfoPayload(p.portador),
    remoteIp: p.ip,
  };

  if (typeof p.capture === "boolean") payload.capture = p.capture;
  if (p.installmentCount && p.installmentCount > 1) {
    payload.installmentCount = p.installmentCount;
  }

  const { data } = await asaas.post<AsaasPayment>("/payments", payload);
  return data;
}

// DÉBITO
export async function criarPagamentoDebito(p: CriarPagamentoDebito): Promise<AsaasPayment> {
  const payload: any = {
    customer: p.customerId,
    value: p.valor,
    billingType: "DEBIT_CARD" as const,
    description: p.descricao,
    debitCard: buildCreditCardPayload(p.cartao),
    creditCardHolderInfo: buildHolderInfoPayload(p.portador),
    remoteIp: p.ip,
  };

  const { data } = await asaas.post<AsaasPayment>("/payments", payload);
  return data;
}

// ------------------------ consultas ------------------------

export async function obterQrCodePix(paymentId: string): Promise<AsaasPixQrCode> {
  const { data } = await asaas.get<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  return data;
}

export async function obterBoletoInfo(paymentId: string) {
  const { data } = await asaas.get<AsaasPayment>(`/payments/${paymentId}`);
  return {
    id: data.id,
    status: data.status,
    value: data.value,
    dueDate: data.dueDate,
    invoiceUrl: data.invoiceUrl,
    bankSlipUrl: (data as any).bankSlipUrl,
    identificationField: (data as any).identificationField,
    customer: data.customer,
    description: data.description,
  };
}

// ------------------------ orquestrador ------------------------

export async function criarPagamento(params: CriarPagamentoParams) {
  try {
    switch (params.tipo) {
      case "PIX":
        return await criarPagamentoPix(params);
      case "BOLETO":
        return await criarPagamentoBoleto(params);
      case "CREDIT_CARD":
        return await criarPagamentoCredito(params);
      case "DEBIT_CARD":
        return await criarPagamentoDebito(params);
      default:
        throw new Error(`Tipo de pagamento inválido: ${(params as any).tipo}`);
    }
  } catch (err: any) {
    const details = err?.response?.data ?? err?.message ?? err;
    throw new Error(`ASAAS_PAYMENT_ERROR: ${JSON.stringify(details)}`);
  }
}

// ------------------------ cliente ------------------------

export async function criarCliente(params: { nome: string; email: string; cpfCnpj?: string }): Promise<any> {
  try {
    const payload: Record<string, any> = {
      name: params.nome,
      email: params.email,
    };
    if (params.cpfCnpj) payload.cpfCnpj = cleanDigits(params.cpfCnpj);

    const { data } = await asaas.post<any>("/customers", payload);
    return data;
  } catch (err: any) {
    const details = err?.response?.data ?? err?.message ?? err;
    throw new Error(`ASAAS_CLIENT_ERROR: ${JSON.stringify(details)}`);
  }
}
