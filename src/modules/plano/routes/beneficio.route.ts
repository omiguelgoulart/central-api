import { Router } from "express";
import { BeneficioController } from "../controllers/beneficio.controller";

const router = Router();
const beneficioController = new BeneficioController();

router.post("/", (req, res) => beneficioController.createBeneficio(req, res));

router.get("/:id", (req, res) => beneficioController.getBeneficioById(req, res));

router.delete("/:id", (req, res) => beneficioController.deleteBeneficio(req, res));

router.patch("/:id", (req, res) => beneficioController.updateBeneficio(req, res));

export default router;