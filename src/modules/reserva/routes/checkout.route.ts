import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { ReservaController } from "../controllers/reserva.controller";
import { ReservaRepository } from "../repositories/reserva.repository";
import { ReservaService } from "../services/reserva.service";

const checkoutRoutes = Router();
const repository = new ReservaRepository();
const service = new ReservaService(repository);
const controller = new ReservaController(service);

checkoutRoutes.use(verificaToken);

checkoutRoutes.post("/confirmar", (req, res) => controller.confirmarCheckout(req, res));

export { checkoutRoutes };
