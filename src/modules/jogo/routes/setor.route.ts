import { Router } from "express";

import { SetorController } from "../controllers/setor.controller";
import { SetorRepository } from "../repositories/setor.repository";
import { SetorService } from "../services/setor.service";

const setorRoutes = Router();

const setorRepository = new SetorRepository();
const setorService = new SetorService(setorRepository);
const setorController = new SetorController(setorService);

setorRoutes.post("/", (req, res) => setorController.createSetor(req, res));

setorRoutes.get("/", (req, res) => setorController.getAllSetores(req, res));

setorRoutes.get("/:id", (req, res) => setorController.getSetorById(req, res));

setorRoutes.delete("/:id", (req, res) => setorController.deleteSetor(req, res));

setorRoutes.patch("/:id", (req, res) => setorController.updateSetor(req, res));

export { setorRoutes };