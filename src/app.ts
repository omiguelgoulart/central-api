import express from "express";
import cors from "cors";

import { planoRouter } from "./modules/plano/routes/plano.route";
import { beneficioRouter } from "./modules/plano/routes/beneficio.route";
import routesAuth from "./modules/users/routes/auth.route";
import {adminRoutes} from "./modules/admin/routes/admin.route";
import {ingressoRoutes } from "./modules/jogo/routes/ingresso.route";
import {jogoRoutes } from "./modules/jogo/routes/jogo.route";
import { jogoSetorRoutes } from "./modules/jogo/routes/jogoSetor.route";
import { setorRoutes } from "./modules/jogo/routes/setor.route";
import { loteRoutes } from "./modules/jogo/routes/lote.route";

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
app.use("/auth", routesAuth);

app.use("/admin", adminRoutes);
app.use("/ingresso", ingressoRoutes)
app.use("/jogo", jogoRoutes);
app.use("/jogo-setor", jogoSetorRoutes);
app.use("/setor", setorRoutes);
app.use("/lote", loteRoutes);

app.get("/", (req, res) => {
  res.send("API central de torcedores!");
});

export default app;