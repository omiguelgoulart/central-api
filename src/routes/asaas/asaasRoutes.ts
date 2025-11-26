import { Router } from "express";
import { z } from "zod";
import {
  criarCliente,
  criarPagamento,
  obterBoletoPdf,
  obterQrCodePix,
  obterStatusPagamento,
  CriarPagamentoPix,
  CriarPagamentoBoleto,
  CriarPagamentoCredito,
  CriarPagamentoDebito,
} from "./asaasService";

const router = Router();


function getClientIp(req: any): string | undefined {
  const xf = req.headers["x-forwarded-for"];
  if (Array.isArray(xf)) return xf[0];
  if (typeof xf === "string") return xf.split(",")[0]?.trim();
  return req.ip;
}

const cartaoSchema = z.object({
  holderName: z.string().min(1),
  number: z.string().min(12),
  expiryMonth: z.string().min(1),
  expiryYear: z.string().min(4),
  ccv: z.string().min(3),
});

const portadorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  cpfCnpj: z.string().min(11),
  postalCode: z.string().min(5),
  addressNumber: z.string().min(1),
  phone: z.string().min(8),
});

// Base
const pagamentoBase = z.object({
  customerId: z.string().min(1),
  valor: z.number().positive(),
  descricao: z.string().min(1).default(""),
  dueDate: z.string().optional(), // YYYY-MM-DD (opcional para PIX/BOLETO; crédito/débito geralmente ignora)
  tipo: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"]),
});

// Discriminadas por tipo
const pagamentoPix = pagamentoBase.extend({ tipo: z.literal("PIX") });

const pagamentoBoleto = pagamentoBase.extend({ tipo: z.literal("BOLETO") });

const pagamentoCredito = pagamentoBase.extend({
  tipo: z.literal("CREDIT_CARD"),
  cartao: cartaoSchema,
  portador: portadorSchema,
  installmentCount: z.number().int().min(1).optional(),
  capture: z.boolean().optional(),
});

const pagamentoDebito = pagamentoBase.extend({
  tipo: z.literal("DEBIT_CARD"),
  cartao: cartaoSchema,
  portador: portadorSchema,
});

const pagamentoUnion = z.discriminatedUnion("tipo", [
  pagamentoPix,
  pagamentoBoleto,
  pagamentoCredito,
  pagamentoDebito,
]);


// Criar cliente
router.post("/clientes", async (req, res) => {
  const bodySchema = z.object({
    nome: z.string().min(1),
    email: z.string().email(),
    cpfCnpj: z.string().optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validação falhou", issues: parsed.error.flatten() });
  }

  try {
    const { nome, email, cpfCnpj } = parsed.data;
    const cliente = await criarCliente({ nome, email, cpfCnpj });
    return res.status(201).json(cliente);
  } catch (error: any) {
    const details = error?.response?.data ?? error?.message ?? error;
    return res.status(502).json({ error: "Erro ao criar cliente no Asaas", details });
  }
});

// Criar pagamento
router.post("/pagamentos", async (req, res) => {
  // Converte valor string -> number se necessário
  if (typeof req.body?.valor === "string") {
    const n = Number(req.body.valor);
    if (!Number.isFinite(n)) {
      return res.status(400).json({ error: "Campo 'valor' inválido" });
    }
    req.body.valor = n;
  }

  const parsed = pagamentoUnion.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validação falhou", issues: parsed.error.flatten() });
  }

  try {
    const ip = getClientIp(req);

    // Monta o payload exato esperado pelo serviço (narrowing por tipo)
    const p = parsed.data;
    let pagamento;
    switch (p.tipo) {
      case "PIX":
        pagamento = await criarPagamento({ ...p } as CriarPagamentoPix);
        break;
      case "BOLETO":
        pagamento = await criarPagamento({ ...p } as CriarPagamentoBoleto);
        break;
      case "CREDIT_CARD":
        pagamento = await criarPagamento({ ...(p as any), ip } as CriarPagamentoCredito);
        break;
      case "DEBIT_CARD":
        pagamento = await criarPagamento({ ...(p as any), ip } as CriarPagamentoDebito);
        break;
    }

    return res.status(201).json(pagamento);
  } catch (error: any) {
    // Se o Asaas respondeu algo, devolvemos como details e 502 (Bad Gateway)
    const details = error?.response?.data ?? error?.message ?? error;
    console.error("ASAAS ERROR:", details);
    return res.status(502).json({ error: "Erro ao criar pagamento no Asaas", details });
  }
});

// Obter QRCode PIX
router.get("/pagamentos/:paymentId/pixQrCode", async (req, res) => {
  const paramsSchema = z.object({ paymentId: z.string().min(1) });
  const parsed = paramsSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Parâmetro 'paymentId' inválido" });
  }

  try {
    const qrCodeData = await obterQrCodePix(parsed.data.paymentId);
    return res.status(200).json(qrCodeData);
  } catch (error: any) {
    const details = error?.response?.data ?? error?.message ?? error;
    return res.status(502).json({ error: "Erro ao obter QR Code Pix no Asaas", details });
  }
});

router.get("/pagamentos/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const info = await obterStatusPagamento(id);
    res.json(info);
  } catch (err: any) {
    const details = err?.response?.data ?? err?.message ?? err;
    res.status(400).json({ error: "ASAAS_STATUS_ERROR", details });
  }
});

router.get("/pagamentos/:id/pdfBoleto", async (req, res) => {
  try {
    const pdf = await obterBoletoPdf(req.params.id);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="boleto-${req.params.id}.pdf"`,
    });

    return res.send(pdf);
  } catch (err: any) {
    const details = err?.message ?? "Erro ao obter PDF";
    return res.status(400).json({ error: details });
  }
});


export default router;
