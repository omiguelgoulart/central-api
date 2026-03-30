import { Router } from "express";

import { verificaToken } from "../../../middlewares/verificaToken";
import { AdminController } from "../controllers/admin.controller";
import { AdminRepository } from "../repositories/admin.repository";
import { AdminService } from "../services/admin.service";

const adminRoutes = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

adminRoutes.use(verificaToken);

adminRoutes.post("/", (req, res) => adminController.createAdmin(req, res));

adminRoutes.get("/", (req, res) => adminController.getAllAdmins(req, res));

adminRoutes.get("/:id", (req, res) => adminController.getAdminbyId(req, res));

adminRoutes.delete("/:id", (req, res) => adminController.deleteAdmin(req, res));

adminRoutes.patch("/:id", (req, res) => adminController.updateAdmin(req, res));

export { adminRoutes };