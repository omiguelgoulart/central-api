import { Router } from "express";
import { PlanoController } from "../controllers/plano.controller";

const router = Router();
const planoController = new PlanoController();

router.post("/", (req, res) => planoController.createPlano(req, res));

router.get("/", (req, res) => planoController.getAllPlanos(res));

router.get("/:id", (req, res) => planoController.getPlanoById(req, res));

router.delete("/:id", (req, res) => planoController.deletePlano(req, res));

export default router;
