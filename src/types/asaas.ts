export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD";

export interface AsaasPayment {
  id: string;
  billingType: BillingType;
  status: "PENDING" | "CONFIRMED" | "RECEIVED" | "OVERDUE" | string;
  value: number;
  dueDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  identificationField?: string;
  customer: string;
  description?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
  description?: string;
  success?: boolean;
}

