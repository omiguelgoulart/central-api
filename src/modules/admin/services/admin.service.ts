import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

;
import { AdminRepository } from "../repositories/admin.repository";
import { CreateAdminInput, UpdateAdminInput } from "../types/admin.type";

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) { }

  async createAdmin(data: CreateAdminInput) {
    const adminExistente = await this.adminRepository.findAdminByEmail(data.email);

    if (adminExistente) {
      throw new Error("Já existe um admin com este e-mail");
    }

    const senhaHash = await hash(data.senha, 10);

    const novoAdmin = await this.adminRepository.createAdmin({
      ...data,
      senha: senhaHash,
    });

    return {
      message: "Admin criado com sucesso",
      adminId: novoAdmin.id,
    };
  }

  async getAllAdmins() {
    return this.adminRepository.getAllAdmins();
  }

  async getAdminById(id: string) {
    const admin = await this.adminRepository.getAdminById(id);

    if (!admin) {
      throw new Error("Admin não encontrado");
    }

    return admin;
  }

  async deleteAdmin(id: string) {
    const adminExistente = await this.adminRepository.getAdminById(id);

    if (!adminExistente) {
      throw new Error("Admin não encontrado");
    }

    await this.adminRepository.deleteAdmin(id);

    return {
      message: "Admin deletado com sucesso",
    };
  }

  async updateAdmin(id: string, data: UpdateAdminInput) {
    const adminExistente = await this.adminRepository.getAdminById(id);

    if (!adminExistente) {
      throw new Error("Admin não encontrado");
    }

    const dataToUpdate: UpdateAdminInput = {
      nome: data.nome,
      email: data.email,
      role: data.role,
      senha: data.senha,
      ativo: data.ativo,
    };

    if (data.senha) {
      dataToUpdate.senha = await hash(data.senha, 10);
    }

    return this.adminRepository.updateAdmin(id, dataToUpdate);
  }

  async loginAdmin(email: string, senha: string) {
    const admin = await this.adminRepository.findAdminByEmail(email);

    if (!admin) {
      throw new Error("E-mail ou senha inválidos");
    }

    const senhaValida = await compare(senha, admin.senha);

    if (!senhaValida) {
      throw new Error("E-mail ou senha inválidos");
    }

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