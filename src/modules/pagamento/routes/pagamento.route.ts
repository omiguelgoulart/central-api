import { Router } from "express";
import { verificaToken } from "../../../middlewares/verificaToken";

import { PagamentoRepository } from "../repositories/pagamento.repository";
import { PagamentoService } from "../services/pagamento.service";
import { PagamentoController } from "../controllers/pagamento.controller";

const pagamentoRoutes = Router();

const repository = new PagamentoRepository();
const service = new PagamentoService(repository);
const controller = new PagamentoController(service);

pagamentoRoutes.use(verificaToken);

pagamentoRoutes.post("/", (req, res) => controller.createPagamento(req, res));
pagamentoRoutes.get("/", (_req, res) => controller.getAllPagamentos(res));
pagamentoRoutes.get("/:id", (req, res) => controller.getPagamentoById(req, res));

export { pagamentoRoutes };
