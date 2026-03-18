import { Request, Response } from "express";
import { ZodError } from "zod";

import { UserService } from "../services/users.service";
import { usuarioSchema, updateUsuarioSchema } from "../schemas/users.schema";

export class UsersController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async createUser(req: Request, res: Response) {
        try {
            const data = usuarioSchema.parse(req.body);
            const result = await this.userService.createUser(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar usuário', detalhe: String(error) });
        }
    }

    async getAllUsers(res: Response) {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuários', detalhe: String(error) });
        }
    }   

    async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const user = await this.userService.getUserById(id);
            res.status(200).json(user);
        }        catch (error) {
            console.error(error);          
            res.status(500).json({ error: 'Erro ao buscar usuário', detalhe: String(error) });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.userService.deleteUser(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar usuário', detalhe: String(error) });
        }
    }

    async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const data = updateUsuarioSchema.parse(req.body);
            const result = await this.userService.updateUser(id, data);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar usuário', detalhe: String(error) });
        }

    }

    async coutUsers(res: Response) {
        try {
            const count = await this.userService.countUsers();
            res.status(200).json({ count });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao contar usuários', detalhe: String(error) });
        }
    }

    async getUserWithDetails(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const user = await this.userService.getUserWithDetails(id);
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuário com detalhes', detalhe: String(error) });
        }
    }

    async getUserByEmailToken(emailToken: string) {
        try {
            const user = await this.userService.getUserByEmailToken(emailToken);
            return user;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar usuário por token de email');
        }
    }

    async verifyEmail(token: string) {
        try {
            const result = await this.userService.verifyEmailToken(token);  
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao verificar email');
        }
    }

    async updateEmailToken(id: string, emailToken: string, emailTokenExpiry: Date) {
        try {
            const result = await this.userService.updateEmailToken(id, emailToken, emailTokenExpiry);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar token de email');
        }
    }

    async updatePhotoUrl(id: string, photoUrl: string) {
        try {
            const result = await this.userService.updatePhotoUrl(id, photoUrl);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar URL da foto');
        }
    }

    async markEmailAsVerified(id: string) {
        try {
            const result = await this.userService.markEmailAsVerified(id);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao marcar email como verificado');
        }
    }

}