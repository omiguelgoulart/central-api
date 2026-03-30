import { Router } from "express";

import { JogoSetorController } from "../controllers/jogoSetor.controller";
import { JogoSetorRepository } from "../repositories/jogoSetor.repository";
import { JogoSetorService } from "../services/jogoSetor.service";

const jogoSetorRoutes = Router();

const jogoSetorRepository = new JogoSetorRepository();
const jogoSetorService = new JogoSetorService(jogoSetorRepository);
const jogoSetorController = new JogoSetorController(jogoSetorService);

jogoSetorRoutes.post("/", (req, res) => jogoSetorController.createJogoSetor(req, res));

jogoSetorRoutes.get("/", (req, res) => jogoSetorController.getAllJogoSetores(res));

jogoSetorRoutes.get("/:id", (req, res) => jogoSetorController.getJogoSetorById(req, res));

jogoSetorRoutes.delete("/:id", (req, res) => jogoSetorController.deleteJogoSetor(req, res));

jogoSetorRoutes.patch("/:id", (req, res) => jogoSetorController.updateJogoSetor(req, res));

export { jogoSetorRoutes };