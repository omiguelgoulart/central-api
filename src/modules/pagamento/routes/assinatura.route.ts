import { Router } from "express";

import { AssinaturaRepository } from "../repositories/assinatura.repository";
import { AssinaturaService } from "../services/assinatura.service";
import { AssinaturaController } from "../controllers/assinatura.controller";

const assinaturaRoutes = Router();
const repository = new AssinaturaRepository();
const service = new AssinaturaService(repository);
const controller = new AssinaturaController(service);

assinaturaRoutes.post("/", (req, res) => controller.createAssinatura(req, res));
assinaturaRoutes.get("/", (_req, res) => controller.getAllAssinaturas(res));
assinaturaRoutes.get("/:id", (req, res) => controller.getAssinaturaById(req, res));
assinaturaRoutes.delete("/:id", (req, res) => controller.deleteAssinatura(req, res));
assinaturaRoutes.patch("/:id", (req, res) => controller.updateAssinatura(req, res));

export { assinaturaRoutes };
