import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { AdminService } from "../services/admin.service";
import { AdminRepository } from "../repositories/admin.repository";
import { verificaToken } from "../../../middlewares/verificaToken";

const adminRoutes = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

adminRoutes.use(verificaToken);

adminRoutes.post("/", (req, res) => adminController.createAdmin(req, res));

adminRoutes.get("/", (req, res) => adminController.getAllAdmins(res));

adminRoutes.get("/:id", (req, res) => adminController.getAdminbyId(req, res));

adminRoutes.delete("/:id", (req, res) => adminController.deleteAdmin(req, res));

adminRoutes.patch("/:id", (req, res) => adminController.updateAdmin(req, res));

export { adminRoutes };