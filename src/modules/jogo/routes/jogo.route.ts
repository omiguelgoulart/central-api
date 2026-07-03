import { JogoController } from "../controllers/jogo.controller";
import { JogoRepository } from "../repositories/jogo.repository";
import { JogoService } from "../services/jogo.service";

import { Router } from "express";

const jogoRoutes = Router();

const jogoRepository = new JogoRepository();
const jogoService = new JogoService(jogoRepository);
const jogoController = new JogoController(jogoService);

jogoRoutes.post("/", (req, res) => jogoController.createJogo(req, res));

jogoRoutes.get("/", (req, res) => jogoController.getAllJogos(res));

jogoRoutes.get("/proximos", (req, res) => jogoController.getProximosJogos(req, res));

jogoRoutes.get("/:id/full", (req, res) => jogoController.getJogoFull(req, res));

jogoRoutes.get("/:id", (req, res) => jogoController.getJogoById(req, res));

jogoRoutes.delete("/:id", (req, res) => jogoController.deleteJogo(req, res));

jogoRoutes.patch("/:id", (req, res) => jogoController.updateJogo(req, res));

export { jogoRoutes };