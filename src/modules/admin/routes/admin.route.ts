import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const adminRoutes = Router();
const adminController = new AdminController();

adminRoutes.post('/', (req, res) => adminController.createAdmin(req, res));

adminRoutes.get('/', (req, res) => adminController.getAllAdmins(res));

adminRoutes.get('/:id', (req, res) => adminController.getAdminbyId(req, res));

adminRoutes.delete('/:id', (req, res) => adminController.deleteAdmin(req, res));

adminRoutes.put('/:id', (req, res) => adminController.updateAdmin(req, res));

export default adminRoutes;