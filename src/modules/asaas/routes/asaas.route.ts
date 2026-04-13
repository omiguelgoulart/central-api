import { AsaasController } from "../controllers/asaas.controller";
import { AsaasRepository } from "../repositories/asaas.repository";
import { AsaasService } from "../services/asaas.service";

import { Router } from "express";

const asaasRoutes = Router();
const repository = new AsaasRepository();
const service = new AsaasService(repository);
const controller = new AsaasController(service);

asaasRoutes.post("/clientes", (req, res) => controller.criarCliente(req, res));

asaasRoutes.post("/creditCard/tokenize", (req, res) => controller.tokenizeCard(req, res));

asaasRoutes.post("/pagamentos", (req, res) => controller.criarPagamento(req, res));

asaasRoutes.get("/pagamentos/:id/qrcode", (req, res) => controller.obterQrCodePix(req, res));

asaasRoutes.get("/pagamentos/:id/pixQrCode", (req, res) => controller.obterQrCodePix(req, res));

asaasRoutes.get("/pagamentos/:id/status", (req, res) => controller.obterStatusPagamento(req, res));

asaasRoutes.get("/pagamentos/:id/boleto", (req, res) => controller.obterBoletoPdf(req, res));

export { asaasRoutes };
