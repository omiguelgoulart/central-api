import { Router } from "express";

import { BeneficioController } from "../controllers/beneficio.controller";
import { BeneficioRepository } from "../repositories/beneficio.repository";
import { BeneficioService } from "../services/beneficio.service";

const beneficioRouter = Router();

const beneficioRepository = new BeneficioRepository();
const beneficioService = new BeneficioService(beneficioRepository);
const beneficioController = new BeneficioController(beneficioService);

beneficioRouter.post("/", (req, res) => beneficioController.createBeneficio(req, res));

beneficioRouter.get("/", (req, res) => beneficioController.getAllBeneficios(req, res));

beneficioRouter.get("/:id", (req, res) => beneficioController.getBeneficioById(req, res));

beneficioRouter.delete("/:id", (req, res) => beneficioController.deleteBeneficio(req, res));

beneficioRouter.patch("/:id", (req, res) => beneficioController.updateBeneficio(req, res));

export { beneficioRouter };