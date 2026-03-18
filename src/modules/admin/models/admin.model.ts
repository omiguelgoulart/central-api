import { prisma } from "../../../lib/prisma";
import { CreateAdminInput, UpdateAdminInput } from "../types/admin.type";

import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

export class AdminModel {
    async createAdmin(data: CreateAdminInput) {
        return prisma.admin.create({
            data: {
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                role: data.role,
            },
        });
    }

    async getAllAdmins() {
        return prisma.admin.findMany();
    }

    async getAdminById(id: string) {
        return prisma.admin.findUnique({
            where: { id },
        });
    }

    async deleteAdmin(id: string) {
        return prisma.admin.delete({
            where: { id },
        });
    }

    async updateAdmin(id: string, data: UpdateAdminInput) {
        return prisma.admin.update({
            where: { id },
            data: {
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                role: data.role,
            },
        });
    }

    async findAdminByEmail(email: string) {
        return prisma.admin.findUnique({
            where: { email },
            select: {
                id: true,
                nome: true,
                email: true,
                senha: true,
                role: true,
            },
        });
    }

    async loginAdmin(email: string, senha: string) {
        const admin = await this.findAdminByEmail(email);
        if (!admin) return null;

        const senhaValida = await compare(senha, admin.senha);
        if (!senhaValida) return null;

        if (!process.env.JWT_KEY) {
            throw new Error("JWT_KEY não configurado");
        }

        const token = sign(
            {
                adminLogadoId: admin.id,
                adminLogadoNome: admin.nome,
                adminLogadoRole: admin.role,
            },
            process.env.JWT_KEY,
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