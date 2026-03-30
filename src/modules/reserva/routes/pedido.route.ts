import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { ReservaController } from "../controllers/reserva.controller";
import { ReservaRepository } from "../repositories/reserva.repository";
import { ReservaService } from "../services/reserva.service";

const pedidoRoutes = Router();
const repository = new ReservaRepository();
const service = new ReservaService(repository);
const controller = new ReservaController(service);

pedidoRoutes.use(verificaToken);

pedidoRoutes.post("/", (req, res) => controller.createPedido(req, res));
pedidoRoutes.get("/", (_req, res) => controller.getAllPedidos(res));
pedidoRoutes.get("/:id", (req, res) => controller.getPedidoById(req, res));
pedidoRoutes.patch("/:id", (req, res) => controller.updatePedido(req, res));
pedidoRoutes.delete("/:id", (req, res) => controller.deletePedido(req, res));
pedidoRoutes.post("/:id/itens", (req, res) => controller.addItensPedido(req, res));
pedidoRoutes.patch("/:id/itens/:itemId", (req, res) => controller.updateItemPedido(req, res));
pedidoRoutes.delete("/:id/itens/:itemId", (req, res) => controller.deleteItemPedido(req, res));
pedidoRoutes.post("/:id/confirmar", (req, res) => controller.confirmarPedido(req, res));

export { pedidoRoutes };
