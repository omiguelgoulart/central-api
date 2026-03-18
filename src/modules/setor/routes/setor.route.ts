import { Router } from "express";
import { SetorController } from "../controllers/setor.controller";

const router = Router();

const setorController = new SetorController();

router.post("/", async (req, res) => {
    await setorController.createSetor(req, res);
});

router.get("/", async (req, res) => {
    await setorController.getAllSetores(res);
});

router.get("/:id", async (req, res) => {
    await setorController.getSetorById(req, res);
});

router.delete("/:id", async (req, res) => {
    await setorController.deleteSetor(req, res);
});

router.patch("/:id", async (req, res) => {
    await setorController.updateSetor(req, res);
});

export default router;