import { Request, Response } from "express";
import { ZodError } from "zod";

import { AdminService } from "../services/admin.service";
import { adminSchema, updateAdminSchema } from "../schemas/admin.schema";

export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async createAdmin(req: Request, res: Response) {
        try {
            const data = adminSchema.parse(req.body);
            const result = await this.adminService.createAdmin(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar administrador', detalhe: String(error) });
        }
    }

    async getAllAdmins(res: Response) {
        try {
            const admins = await this.adminService.getAllAdmins();
            res.status(200).json(admins);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar administradores', detalhe: String(error) });
        }
    }

    async getAdminbyId(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const admin = await this.adminService.getAdminById(id);
            res.status(200).json(admin);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar administrador', detalhe: String(error) });
        }
    }

    async deleteAdmin(req: Request, res: Response) {
        const { id } = req.params;
        try {            const result = await this.adminService.deleteAdmin(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar administrador', detalhe: String(error) });
        }
    }

    async updateAdmin(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = updateAdminSchema.parse(req.body);
            const result = await this.adminService.updateAdmin(id, data);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar administrador', detalhe: String(error) });
        }
    }

    async loginAdmin(req: Request, res: Response) {
        const { email, senha } = req.body;
        try {
            const result = await this.adminService.loginAdmin(email, senha);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao realizar login', detalhe: String(error) });
        }
    }
}
