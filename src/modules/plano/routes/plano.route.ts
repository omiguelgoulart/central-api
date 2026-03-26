import { Router } from "express";
import { PlanoRepository } from "../repositories/plano.repository";
import { PlanoService } from "../services/plano.service";
import { PlanoController } from "../controllers/plano.controller";

const planoRouter = Router();

const planoRepository = new PlanoRepository();
const planoService = new PlanoService(planoRepository);
const planoController = new PlanoController(planoService);

planoRouter.post("/", (req, res) => planoController.createPlano(req, res));

planoRouter.get("/", (req, res) => planoController.getAllPlanos(req, res));

planoRouter.get("/:id", (req, res) => planoController.getPlanoById(req, res));

planoRouter.delete("/:id", (req, res) => planoController.deletePlano(req, res));

planoRouter.patch("/:id", (req, res) => planoController.updatePlano(req, res));

export { planoRouter };