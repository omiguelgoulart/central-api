import { AdminModel } from "../models/admin.model";
import { CreateAdminInput, UpdateAdminInput } from "../types/admin.type";

import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

export class AdminService {
    private adminModel: AdminModel;

    constructor() {
        this.adminModel = new AdminModel();
    }

    async createAdmin(data: CreateAdminInput) {
        const emailExistente = await this.adminModel.getAllAdmins().then(admins => admins.find(admin => admin.email === data.email));
        if (emailExistente) {
            throw new Error('Já existe um administrador com esse email');
        }
        const newAdmin = await this.adminModel.createAdmin(data);

        return {
            message: 'Administrador criado com sucesso',
            adminId: newAdmin.id
        };
    }

    async getAllAdmins() {
        return this.adminModel.getAllAdmins();
    }

    async getAdminById(id: string) {
        const admin = await this.adminModel.getAdminById(id);
        if (!admin) {
            throw new Error('Administrador não encontrado');
        }
        return admin;
    }

    async deleteAdmin(id: string) {
        const adminExistente = await this.adminModel.getAdminById(id);
        if (!adminExistente) {
            throw new Error('Administrador não encontrado');
        }
        await this.adminModel.deleteAdmin(id);

        return {
            message: 'Administrador deletado com sucesso'
        };
    }

    async updateAdmin(id: string, data: UpdateAdminInput) {
        const adminExistente = await this.adminModel.getAdminById(id);
        if (!adminExistente) {
            throw new Error('Administrador não encontrado');
        }
        if (data.email) {
            const emailExistente = await this.adminModel.getAllAdmins().then(admins => admins.find(admin => admin.email === data.email));
            if (emailExistente && emailExistente.id !== id) {
                throw new Error('Já existe um administrador com esse email');
            }
        }
        const updatedAdmin = await this.adminModel.updateAdmin(id, data);
        return updatedAdmin;
    }

    async loginAdmin(email: string, senha: string) {
        const mensagemPadrao = "Email ou senha incorretos";
        const admin = await this.adminModel.findAdminByEmail(email);

        if (!admin) {
            throw new Error(mensagemPadrao);
        }

        const senhaConfere = await compare(senha, admin.senha);
        if (!senhaConfere) {
            throw new Error(mensagemPadrao);
        }

        const token = sign(
            {
                userLogadoId: admin.id,
                userLogadoNome: admin.nome,
                userLogadoRole: admin.role,
            },
            process.env.JWT_KEY as string,
            { expiresIn: "1h" }
        );
        return {
            id: admin.id,
            nome: admin.nome,
            email: admin.email,
            role: admin.role,
            token,
        };
    }


}


