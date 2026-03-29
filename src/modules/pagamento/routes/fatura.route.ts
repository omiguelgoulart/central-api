import { Router } from "express";

import { FaturaRepository } from "../repositories/fatura.repository";
import { FaturaService } from "../services/fatura.service";
import { FaturaController } from "../controllers/fatura.controller";

const faturaRoutes = Router();

const repository = new FaturaRepository();
const service = new FaturaService(repository);
const controller = new FaturaController(service);

faturaRoutes.post("/", (req, res) => controller.createFatura(req, res));
faturaRoutes.get("/", (_req, res) => controller.getAllFaturas(res));
faturaRoutes.get("/:id", (req, res) => controller.getFaturaById(req, res));
faturaRoutes.delete("/:id", (req, res) => controller.deleteFatura(req, res));
faturaRoutes.patch("/:id", (req, res) => controller.updateFatura(req, res));

export { faturaRoutes };
