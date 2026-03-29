import { Router } from "express";
import { verificaToken } from "../../../middlewares/verificaToken";

import { ReservaController } from "../controllers/reserva.controller";
import { ReservaRepository } from "../repositories/reserva.repository";
import { ReservaService } from "../services/reserva.service";

const reservaRoutes = Router();
const repository = new ReservaRepository();
const service = new ReservaService(repository);
const controller = new ReservaController(service);

reservaRoutes.use(verificaToken);

reservaRoutes.post("/segurar", (req, res) => controller.segurarReserva(req, res));
reservaRoutes.post("/liberar", (req, res) => controller.liberarReserva(req, res));
reservaRoutes.get("/:partidaId", (req, res) => controller.listarReservas(req, res));

export { reservaRoutes };
