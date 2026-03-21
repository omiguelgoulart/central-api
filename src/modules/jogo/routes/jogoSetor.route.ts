import { Router } from "express";
import { JogoSetorController } from "../controllers/jogoSetor.controller";

const router = Router();

const jogoSetorController = new JogoSetorController();

router.post("/", (req, res) => jogoSetorController.createJogoSetor(req, res));

router.get("/", (req, res) => jogoSetorController.getAllJogoSetores(res));

router.get("/:id", (req, res) => jogoSetorController.getJogoSetorById(req, res));   

router.delete("/:id", (req, res) => jogoSetorController.deleteJogoSetor(req, res));

router.patch("/:id", (req, res) => jogoSetorController.updateJogoSetor(req, res));

export default router;