import { Router } from "express";
import routesPlanos from "../modules/plano/routes/plano.route";
import routesBeneficio from "../modules/plano/routes/beneficio.route";

const router = Router();


router.use("/planos", routesPlanos);
router.use("/beneficio", routesBeneficio);

export default router;