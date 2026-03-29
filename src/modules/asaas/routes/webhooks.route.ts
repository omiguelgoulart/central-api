import { Router } from "express";

import { AsaasController } from "../controllers/asaas.controller";

const asaasWebhookRoutes = Router();
const controller = new AsaasController();

asaasWebhookRoutes.post("/webhooks/asaas", (req, res) => controller.webhookAsaas(req, res));

export { asaasWebhookRoutes };
