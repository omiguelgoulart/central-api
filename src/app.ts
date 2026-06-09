import cors from "cors";
import express from "express";

import { adminRoutes } from "./modules/admin/routes/admin.route";
import { adminLoginRoutes } from "./modules/admin/routes/adminLogin.route";
import { asaasRoutes } from "./modules/asaas/routes/asaas.route";
import { asaasWebhookRoutes } from "./modules/asaas/routes/webhooks.route";
import { checkinRoutes } from "./modules/jogo/routes/checkin.route";
import { ingressoRoutes } from "./modules/jogo/routes/ingresso.route";
import { jogoRoutes } from "./modules/jogo/routes/jogo.route";
import { jogoSetorRoutes } from "./modules/jogo/routes/jogoSetor.route";
import { loteRoutes } from "./modules/jogo/routes/lote.route";
import { setorRoutes } from "./modules/jogo/routes/setor.route";
import { assinaturaRoutes } from "./modules/pagamento/routes/assinatura.route";
import { faturaRoutes } from "./modules/pagamento/routes/fatura.route";
import { pagamentoRoutes } from "./modules/pagamento/routes/pagamento.route";
import { beneficioRouter } from "./modules/plano/routes/beneficio.route";
import { planoRouter } from "./modules/plano/routes/plano.route";
import { checkoutRoutes } from "./modules/reserva/routes/checkout.route";
import { pedidoRoutes } from "./modules/reserva/routes/pedido.route";
import { reservaRoutes } from "./modules/reserva/routes/reserva.route";
import { authRouter } from "./modules/users/routes/auth.route";
import { lgpdAdminRouter } from "./modules/users/routes/lgpd.admin.route";
import { lgpdRouter } from "./modules/users/routes/lgpd.route";
import { usersRouter } from "./modules/users/routes/users.route";

const app = express();

app.use(express.json());

const allowedCorsOrigins = (
  process.env.CORS_ORIGINS ??
  process.env.FRONTEND_URL ??
  "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedCorsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

app.use("/planos", planoRouter);
app.use("/beneficio", beneficioRouter);
app.use("/auth", authRouter);
app.use("/usuario", usersRouter);

app.use("/torcedores", lgpdRouter);
app.use("/admin/torcedores", lgpdAdminRouter);
app.use("/admin/login", adminLoginRoutes);
app.use("/admin/checkin", checkinRoutes);
app.use("/admin", adminRoutes);
app.use("/ingresso", ingressoRoutes);
app.use("/jogo", jogoRoutes);
app.use("/jogo-setor", jogoSetorRoutes);
app.use("/setor", setorRoutes);
app.use("/lote", loteRoutes);
app.use("/pagamento", pagamentoRoutes);
app.use("/fatura", faturaRoutes);
app.use("/assinatura", assinaturaRoutes);
app.use("/reservas", reservaRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/asaas", asaasRoutes);
app.use("/asaas", asaasWebhookRoutes);

app.get("/", (req, res) => {
  res.send("API central de torcedores!");
});

export default app;