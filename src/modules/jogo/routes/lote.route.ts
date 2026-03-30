import { Router } from "express";

import { LoteController } from "../controllers/lote.controller";
import { LoteRepository } from "../repositories/lote.repository";
import { LoteService } from "../services/lote.service";

const loteRoutes = Router();

const loteRepository = new LoteRepository();
const loteService = new LoteService(loteRepository);
const loteController = new LoteController(loteService);

loteRoutes.post("/", (req, res) => loteController.createLote(req, res));

loteRoutes.get("/", (req, res) => loteController.getAllLotes(res));

loteRoutes.get("/:id", (req, res) => loteController.getLoteById(req, res));

loteRoutes.delete("/:id", (req, res) => loteController.deleteLote(req, res));

loteRoutes.patch("/:id", (req, res) => loteController.updateLote(req, res));

export { loteRoutes };