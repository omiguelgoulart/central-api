import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { FaturaController } from "../controllers/fatura.controller";
import { FaturaRepository } from "../repositories/fatura.repository";
import { FaturaService } from "../services/fatura.service";

const faturaRoutes = Router();

const repository = new FaturaRepository();
const service = new FaturaService(repository);
const controller = new FaturaController(service);

faturaRoutes.use(verificaToken);

faturaRoutes.post("/", (req, res) => controller.createFatura(req, res));
faturaRoutes.get("/", (_req, res) => controller.getAllFaturas(res));
faturaRoutes.post("/confirmar-pagamento", (req, res) => controller.confirmarPagamento(req, res));
faturaRoutes.post("/pagar-multiplo", (req, res) => controller.pagarMultiplo(req, res));
faturaRoutes.get("/:id", (req, res) => controller.getFaturaById(req, res));
faturaRoutes.delete("/:id", (req, res) => controller.deleteFatura(req, res));
faturaRoutes.patch("/:id", (req, res) => controller.updateFatura(req, res));
faturaRoutes.post("/:id/boleto", (req, res) => controller.gerarBoleto(req, res));

export { faturaRoutes };
