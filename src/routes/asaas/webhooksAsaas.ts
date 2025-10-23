// src/routes/webhooks.asaas.ts
import { Router } from "express";
import { PrismaClient, StatusPagamento } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/webhooks/asaas", async (req, res) => {
  try {
    // 1) Segurança do webhook
    const token = req.get("asaas-access-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return res.status(401).send("Token inválido");
    }

    // 2) Evento recebido
    const evento = req.body as {
      event?: string;
      payment?: {
        id: string;
        status: "PENDING" | "CONFIRMED" | "RECEIVED" | "RECEIVED_IN_CASH" | "OVERDUE" | "CANCELED" | string;
        confirmedDate?: string;
        billingType?: "PIX" | "BOLETO" | "CREDIT_CARD";
        value?: number;
        customer?: string;
        subscription?: string;
        dueDate?: string;
        invoiceUrl?: string;
      };
    };

    if (!evento?.event) {
      return res.status(400).json({ message: "Evento inválido" });
    }

    console.log("Webhook recebido:", evento.event);

    // 3) Só tratamos eventos de pagamento
    if (evento.event.startsWith("PAYMENT_") && evento.payment?.id) {
      const pagamento = evento.payment;

      const novoStatus = mapStatus(pagamento.status);
      const pagoEm =
        novoStatus === StatusPagamento.PAGO && pagamento.confirmedDate
          ? new Date(pagamento.confirmedDate)
          : novoStatus === StatusPagamento.PAGO
          ? new Date()
          : null;

      // Se gatewayPaymentId não for único, pode deixar updateMany
      const resultado = await prisma.pagamento.updateMany({
        where: { gatewayPaymentId: pagamento.id },
        data: {
          status: novoStatus,
          pagoEm,
        },
      });

      console.log("Registros atualizados:", resultado.count);
    }

    // 4) Responder rápido (Asaas reenvia se != 200)
    return res.sendStatus(200);
  } catch (err: any) {
    console.error("Erro no webhook Asaas:", err?.message || err);
    return res.sendStatus(500);
  }
});

// Mapeia status ASAAS -> seu enum Prisma
function mapStatus(status: string): StatusPagamento {
  switch (status) {
    case "CONFIRMED":
    case "RECEIVED":
    case "RECEIVED_IN_CASH":
      return StatusPagamento.PAGO;
    case "OVERDUE":
      return StatusPagamento.ATRASADO;
    case "CANCELED":
      return StatusPagamento.CANCELADO;
    case "PENDING":
    default:
      return StatusPagamento.PENDENTE;
  }
}

export default router;
