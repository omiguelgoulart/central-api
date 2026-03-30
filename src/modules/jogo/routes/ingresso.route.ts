import { Router } from "express";

import { IngressoController } from "../controllers/ingresso.controller";
import { IngressoRepository } from "../repositories/ingresso.repository";
import { IngressoService } from "../services/ingresso.service";

const ingressoRoutes = Router();

const ingressoRepository = new IngressoRepository();
const ingressoService = new IngressoService(ingressoRepository);
const ingressoController = new IngressoController(ingressoService);

ingressoRoutes.post("/", (req, res) => ingressoController.createIngresso(req, res));

ingressoRoutes.get("/", (req, res) => ingressoController.getAllIngressos(res));

ingressoRoutes.get("/:id", (req, res) => ingressoController.getIngressoById(req, res));

ingressoRoutes.delete("/:id", (req, res) => ingressoController.deleteIngresso(req, res));

ingressoRoutes.patch("/:id", (req, res) => ingressoController.updateIngresso(req, res));

ingressoRoutes.patch("/:id/status", (req, res) => ingressoController.updateIngressoStatus(req, res));

export { ingressoRoutes };