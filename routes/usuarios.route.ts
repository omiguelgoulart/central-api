import { Router } from "express";
import { criaUsuario, listaUsuarios, deletaUsuario, atualizaUsuario } from "../controllers/usuarios.controller";

const router = Router();

router.post("/", criaUsuario);
router.get("/", listaUsuarios);
router.delete("/:id", deletaUsuario);
router.patch("/:id", atualizaUsuario);

export default router;