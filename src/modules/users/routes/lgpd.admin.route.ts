import { Router } from "express";

import { verificaAdminRole } from "../../../middlewares/verificaAdminRole";
import { LgpdController } from "../controllers/lgpd.controller";
import { LgpdService } from "../services/lgpd.service";

const lgpdAdminRouter = Router();

const service = new LgpdService();
const controller = new LgpdController(service);

lgpdAdminRouter.delete(
  "/:id",
  verificaAdminRole(["SUPER_ADMIN"]),
  (req, res) => controller.anonimizarTorcedorAdmin(req, res)
);

export { lgpdAdminRouter };
