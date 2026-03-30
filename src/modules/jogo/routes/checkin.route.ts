import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { CheckinController } from "../controllers/checkin.controller";
import { CheckinRepository } from "../repositories/checkin.repository";
import { CheckinService } from "../services/checkin.service";

const checkinRoutes = Router();
const repository = new CheckinRepository();
const service = new CheckinService(repository);
const controller = new CheckinController(service);

checkinRoutes.use(verificaToken);

checkinRoutes.post("/", (req, res) => controller.checkin(req, res));

export { checkinRoutes };