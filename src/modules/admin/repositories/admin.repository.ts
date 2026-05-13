import { prisma } from "../../../lib/prisma";
import { CreateAdminInput, UpdateAdminInput } from "../types/admin.type";

export class AdminRepository {
  constructor(private readonly prismaClient = prisma) {}

  private readonly adminSelect = {
    id: true,
    nome: true,
    email: true,
    role: true,
    ativo: true,
    criadoEm: true,
  } as const;

  async createAdmin(data: CreateAdminInput) {
    return this.prismaClient.admin.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: data.role,
        ativo: data.ativo,
      },
      select: this.adminSelect,
    });
  }

  async getAllAdmins() {
    return this.prismaClient.admin.findMany({ select: this.adminSelect });
  }

  async getAdminById(id: string) {
    return this.prismaClient.admin.findUnique({
      where: { id },
      select: this.adminSelect,
    });
  }

  async deleteAdmin(id: string) {
    return this.prismaClient.admin.delete({
      where: { id },
    });
  }

  async updateAdmin(id: string, data: UpdateAdminInput) {
    return this.prismaClient.admin.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: data.role,
        ativo: data.ativo,
      },
      select: this.adminSelect,
    });
  }

  async findAdminByEmail(email: string) {
    return this.prismaClient.admin.findUnique({
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
}