import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "../services/auth.service";

const authRouter = Router();

const repository = new AuthRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

authRouter.post("/login", (req, res) => controller.login(req, res));

authRouter.post("/forgot-password", (req, res) => controller.forgotPassword(req, res));

authRouter.post("/reset-password", (req, res) => controller.resetPassword(req, res));

export { authRouter };