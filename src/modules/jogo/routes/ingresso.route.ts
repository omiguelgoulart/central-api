import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { IngressoController } from "../controllers/ingresso.controller";
import { IngressoSimpleController } from "../controllers/ingresso-simple.controller";
import { IngressoRepository } from "../repositories/ingresso.repository";
import { IngressoService } from "../services/ingresso.service";
import { IngressoSimpleService } from "../services/ingresso-simple.service";

const ingressoRoutes = Router();

const ingressoRepository = new IngressoRepository();
const ingressoService = new IngressoService(ingressoRepository);
const ingressoController = new IngressoController(ingressoService);

const ingressoSimpleService = new IngressoSimpleService();
const ingressoSimpleController = new IngressoSimpleController(ingressoSimpleService);

ingressoRoutes.post("/", (req, res) => ingressoController.createIngresso(req, res));
ingressoRoutes.post("/pagamento/criar", verificaToken, (req, res) => ingressoSimpleController.criarIngressoComPagamento(req, res));

ingressoRoutes.get("/", (req, res) => ingressoController.getAllIngressos(res));

ingressoRoutes.get("/:id", (req, res) => ingressoController.getIngressoById(req, res));

ingressoRoutes.delete("/:id", (req, res) => ingressoController.deleteIngresso(req, res));

ingressoRoutes.patch("/:id", (req, res) => ingressoController.updateIngresso(req, res));

ingressoRoutes.patch("/:id/status", (req, res) => ingressoController.updateIngressoStatus(req, res));

export { ingressoRoutes };