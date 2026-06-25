import { Request, Response } from "express";
import { ZodError } from "zod";

import { usuarioSchema, updateUsuarioSchema } from "../schemas/users.schema";
import { UserService } from "../services/users.service";

export class UsersController {
    constructor(private readonly service = new UserService()) { }

    async createUser(req: Request, res: Response) {
        try {
            const data = usuarioSchema.parse(req.body);
            const result = await this.service.createUser(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            if (error instanceof Error) {
                const msg = error.message;
                if (msg === 'Já existe um usuário com esse email') {
                    res.status(409).json({ message: msg });
                    return;
                }
                if (msg === 'Não foi possível gerar uma matrícula única') {
                    res.status(503).json({ message: 'Serviço temporariamente indisponível. Tente novamente.' });
                    return;
                }
            }
            console.error(error);
            res.status(500).json({ message: 'Erro ao criar usuário. Tente novamente mais tarde.' });
        }
    }

    async getAllUsers(res: Response) {
        try {
            const users = await this.service.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuários', detalhe: String(error) });
        }
    }

    async getUserByToken(req: Request, res: Response) {
        const userId = req.userLogadoId
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        try {
            const user = await this.service.getUserByToken(userId);
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuário', detalhe: String(error) });
        }

    }


    async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const user = await this.service.getUserById(id);
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuário', detalhe: String(error) });
        }
    }

    async getUserByCpf(req: Request, res: Response) {
        const { cpf } = req.params;
        try {
            const user = await this.service.getUserByCpf(cpf);
            res.status(200).json(user);
        } catch (error) {
            if (error instanceof Error && (error.message === 'CPF inválido' || error.message === 'Usuário não encontrado')) {
                res.status(400).json({ error: error.message });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuário por CPF', detalhe: String(error) });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.service.deleteUser(id);
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
            const result = await this.service.updateUser(id, data);
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
            const count = await this.service.countUsers();
            res.status(200).json({ count });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao contar usuários', detalhe: String(error) });
        }
    }

    async getUserWithDetails(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const user = await this.service.getUserWithDetails(id);
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuário com detalhes', detalhe: String(error) });
        }
    }

    async getUserByEmailToken(emailToken: string) {
        try {
            const user = await this.service.getUserByEmailToken(emailToken);
            return user;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar usuário por token de email');
        }
    }

    async verifyEmail(req: Request, res: Response) {
        try {
            const token = String(req.body?.token ?? "").trim();
            if (!token) {
                res.status(400).json({ error: 'Token de email é obrigatório' });
                return;
            }

            const result = await this.service.verifyEmailToken(token);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao verificar email', detalhe: String(error) });
        }
    }

    async updateEmailToken(id: string, emailToken: string, emailTokenExpiry: Date) {
        try {
            const result = await this.service.updateEmailToken(id, emailToken, emailTokenExpiry);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar token de email');
        }
    }

    async updatePhotoUrl(id: string, photoUrl: string) {
        try {
            const result = await this.service.updatePhotoUrl(id, photoUrl);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao atualizar URL da foto');
        }
    }

    async markEmailAsVerified(id: string) {
        try {
            const result = await this.service.markEmailAsVerified(id);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao marcar email como verificado');
        }
    }

}