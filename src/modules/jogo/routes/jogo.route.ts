import { Router } from "express";
import { JogoController } from "../controllers/jogo.controller";

const router = Router();
const jogoController = new JogoController();

router.post("/", (req, res) => jogoController.createJogo(req, res));

router.get("/", (req, res) => jogoController.getAllJogos(res));

router.get("/:id", (req, res) => jogoController.getJogoById(req, res));

router.delete("/:id", (req, res) => jogoController.deleteJogo(req, res));