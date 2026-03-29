import { Router } from "express";

import { ReservaController } from "../controllers/reserva.controller";
import { ReservaRepository } from "../repositories/reserva.repository";
import { ReservaService } from "../services/reserva.service";

const checkoutRoutes = Router();
const repository = new ReservaRepository();
const service = new ReservaService(repository);
const controller = new ReservaController(service);

checkoutRoutes.post("/confirmar", (req, res) => controller.confirmarCheckout(req, res));

export { checkoutRoutes };
