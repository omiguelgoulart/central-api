import { Router } from "express";
import { verificaToken } from "../../../middlewares/verificaToken";

import { CheckinRepository } from "../repositories/checkin.repository";
import { CheckinService } from "../services/checkin.service";
import { CheckinController } from "../controllers/checkin.controller";

const checkinRoutes = Router();
const repository = new CheckinRepository();
const service = new CheckinService(repository);
const controller = new CheckinController(service);

checkinRoutes.use(verificaToken);

checkinRoutes.post("/", (req, res) => controller.checkin(req, res));

export { checkinRoutes };