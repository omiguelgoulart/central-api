import { Router } from "express";

import { AdminLoginController } from "../controllers/adminLogin.controller";

const adminLoginRoutes = Router();
const controller = new AdminLoginController();

adminLoginRoutes.post("/", (req, res) => controller.login(req, res));

export { adminLoginRoutes };
