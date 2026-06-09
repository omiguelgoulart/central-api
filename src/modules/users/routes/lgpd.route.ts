import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { LgpdController } from "../controllers/lgpd.controller";
import { LgpdService } from "../services/lgpd.service";

const lgpdRouter = Router();

const service = new LgpdService();
const controller = new LgpdController(service);

lgpdRouter.delete("/me", verificaToken, (req, res) => controller.deletarMinhaConta(req, res));

export { lgpdRouter };
