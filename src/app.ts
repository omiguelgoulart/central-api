import express from "express";
import cors from "cors";

import routesPlanos from "./modules/plano/routes/plano.route";
import routesBeneficio from "./modules/plano/routes/beneficio.route";
import routesAuth from "./modules/users/routes/auth.route";


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

app.use("/planos", routesPlanos);
app.use("/beneficio", routesBeneficio);
app.use("/auth", routesAuth);

app.get("/", (req, res) => {
  res.send("API central de torcedores!");
});

export default app;