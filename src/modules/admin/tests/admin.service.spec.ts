import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  sign: vi.fn(),
}));

import { AdminService } from "../services/admin.service";
import { AdminRepository } from "../repositories/admin.repsitory";
import { CreateAdminInput, UpdateAdminInput } from "../types/admin.type";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const bcryptMocked = vi.mocked(bcrypt);
const jwtMocked = vi.mocked(jwt);

type AdminMock = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: string;
};

type AdminRepositoryMock = {
  findAdminByEmail: ReturnType<typeof vi.fn>;
  createAdmin: ReturnType<typeof vi.fn>;
  getAllAdmins: ReturnType<typeof vi.fn>;
  getAdminById: ReturnType<typeof vi.fn>;
  deleteAdmin: ReturnType<typeof vi.fn>;
  updateAdmin: ReturnType<typeof vi.fn>;
};

describe("AdminService", () => {
  let adminRepositoryMock: AdminRepositoryMock;
  let adminService: AdminService;

  beforeEach(() => {
    adminRepositoryMock = {
      findAdminByEmail: vi.fn(),
      createAdmin: vi.fn(),
      getAllAdmins: vi.fn(),
      getAdminById: vi.fn(),
      deleteAdmin: vi.fn(),
      updateAdmin: vi.fn(),
    };

    adminService = new AdminService(
      adminRepositoryMock as unknown as AdminRepository
    );

    vi.clearAllMocks();
    delete process.env.JWT_KEY;
  });

  describe("createAdmin", () => {
    it("deve criar admin com sucesso", async () => {
      const input: CreateAdminInput = {
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "123456",
        role: "SUPER_ADMIN",
      };

      adminRepositoryMock.findAdminByEmail.mockResolvedValue(null);
      bcryptMocked.hash.mockResolvedValue("senha-hash" as never);
      adminRepositoryMock.createAdmin.mockResolvedValue({
        id: "admin-1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "senha-hash",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      const result = await adminService.createAdmin(input);

      expect(adminRepositoryMock.findAdminByEmail).toHaveBeenCalledWith(
        "tanise@email.com"
      );
      expect(bcryptMocked.hash).toHaveBeenCalledWith("123456", 10);
      expect(adminRepositoryMock.createAdmin).toHaveBeenCalledWith({
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "senha-hash",
        role: "SUPER_ADMIN",
      });
      expect(result).toEqual({
        message: "Admin criado com sucesso",
        adminId: "admin-1",
      });
    });

    it("deve lançar erro se já existir admin com o mesmo e-mail", async () => {
      const input: CreateAdminInput = {
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "123456",
        role: "SUPER_ADMIN",
      };

      adminRepositoryMock.findAdminByEmail.mockResolvedValue({
        id: "admin-1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      await expect(adminService.createAdmin(input)).rejects.toThrow(
        "Já existe um admin com este e-mail"
      );

      expect(adminRepositoryMock.createAdmin).not.toHaveBeenCalled();
    });
  });

  describe("getAllAdmins", () => {
    it("deve retornar todos os admins", async () => {
      const admins: AdminMock[] = [
        {
          id: "1",
          nome: "Admin 1",
          email: "admin1@email.com",
          senha: "hash1",
          role: "SUPER_ADMIN",
        },
        {
          id: "2",
          nome: "Admin 2",
          email: "admin2@email.com",
          senha: "hash2",
          role: "SUPER_ADMIN",
        },
      ];

      adminRepositoryMock.getAllAdmins.mockResolvedValue(admins);

      const result = await adminService.getAllAdmins();

      expect(adminRepositoryMock.getAllAdmins).toHaveBeenCalled();
      expect(result).toEqual(admins);
    });
  });

  describe("getAdminById", () => {
    it("deve retornar admin quando encontrado", async () => {
      const admin: AdminMock = {
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash",
        role: "SUPER_ADMIN",
      };

      adminRepositoryMock.getAdminById.mockResolvedValue(admin);

      const result = await adminService.getAdminById("1");

      expect(adminRepositoryMock.getAdminById).toHaveBeenCalledWith("1");
      expect(result).toEqual(admin);
    });

    it("deve lançar erro quando admin não for encontrado", async () => {
      adminRepositoryMock.getAdminById.mockResolvedValue(null);

      await expect(adminService.getAdminById("1")).rejects.toThrow(
        "Admin não encontrado"
      );
    });
  });

  describe("deleteAdmin", () => {
    it("deve deletar admin com sucesso", async () => {
      adminRepositoryMock.getAdminById.mockResolvedValue({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      adminRepositoryMock.deleteAdmin.mockResolvedValue(undefined);

      const result = await adminService.deleteAdmin("1");

      expect(adminRepositoryMock.getAdminById).toHaveBeenCalledWith("1");
      expect(adminRepositoryMock.deleteAdmin).toHaveBeenCalledWith("1");
      expect(result).toEqual({
        message: "Admin deletado com sucesso",
      });
    });

    it("deve lançar erro ao tentar deletar admin inexistente", async () => {
      adminRepositoryMock.getAdminById.mockResolvedValue(null);

      await expect(adminService.deleteAdmin("1")).rejects.toThrow(
        "Admin não encontrado"
      );

      expect(adminRepositoryMock.deleteAdmin).not.toHaveBeenCalled();
    });
  });

  describe("updateAdmin", () => {
    it("deve atualizar admin sem alterar senha", async () => {
      const input: UpdateAdminInput = {
        nome: "Novo Nome",
        email: "novo@email.com",
        role: "SUPER_ADMIN",
      };

      adminRepositoryMock.getAdminById.mockResolvedValue({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      adminRepositoryMock.updateAdmin.mockResolvedValue({
        id: "1",
        nome: "Novo Nome",
        email: "novo@email.com",
        senha: "hash",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      const result = await adminService.updateAdmin("1", input);

      expect(adminRepositoryMock.updateAdmin).toHaveBeenCalledWith("1", {
        nome: "Novo Nome",
        email: "novo@email.com",
        role: "SUPER_ADMIN",
        senha: undefined,
      });
      expect(result).toEqual({
        id: "1",
        nome: "Novo Nome",
        email: "novo@email.com",
        senha: "hash",
        role: "SUPER_ADMIN",
      });
    });

    it("deve atualizar admin com nova senha criptografada", async () => {
      const input: UpdateAdminInput = {
        nome: "Novo Nome",
        email: "novo@email.com",
        senha: "nova-senha",
        role: "SUPER_ADMIN",
      };

      adminRepositoryMock.getAdminById.mockResolvedValue({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash-antigo",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      bcryptMocked.hash.mockResolvedValue("novo-hash" as never);

      adminRepositoryMock.updateAdmin.mockResolvedValue({
        id: "1",
        nome: "Novo Nome",
        email: "novo@email.com",
        senha: "novo-hash",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      const result = await adminService.updateAdmin("1", input);

      expect(bcryptMocked.hash).toHaveBeenCalledWith("nova-senha", 10);
      expect(adminRepositoryMock.updateAdmin).toHaveBeenCalledWith("1", {
        nome: "Novo Nome",
        email: "novo@email.com",
        role: "SUPER_ADMIN",
        senha: "novo-hash",
      });
      
      expect(result).toEqual({
        id: "1",
        nome: "Novo Nome",
        email: "novo@email.com",
        senha: "novo-hash",
        role: "SUPER_ADMIN",
      });
    });

    it("deve lançar erro ao tentar atualizar admin inexistente", async () => {
      adminRepositoryMock.getAdminById.mockResolvedValue(null);

      await expect(
        adminService.updateAdmin("1", {
          nome: "Novo Nome",
        } as UpdateAdminInput)
      ).rejects.toThrow("Admin não encontrado");

      expect(adminRepositoryMock.updateAdmin).not.toHaveBeenCalled();
    });
  });

  describe("loginAdmin", () => {
    it("deve fazer login com sucesso", async () => {
      process.env.JWT_KEY = "segredo-teste";

      adminRepositoryMock.findAdminByEmail.mockResolvedValue({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash-senha",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      bcryptMocked.compare.mockResolvedValue(true as never);
      jwtMocked.sign.mockReturnValue("token-falso" as never);

      const result = await adminService.loginAdmin(
        "tanise@email.com",
        "123456"
      );

      expect(adminRepositoryMock.findAdminByEmail).toHaveBeenCalledWith(
        "tanise@email.com"
      );
      expect(bcryptMocked.compare).toHaveBeenCalledWith("123456", "hash-senha");
      expect(jwtMocked.sign).toHaveBeenCalledWith(
        {
          adminLogadoId: "1",
          adminLogadoNome: "Tanise",
          adminLogadoRole: "SUPER_ADMIN",
        },
        "segredo-teste",
        { expiresIn: "1h" }
      );
      expect(result).toEqual({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        role: "SUPER_ADMIN",
        token: "token-falso",
      });
    });

    it("deve lançar erro quando e-mail não existir", async () => {
      adminRepositoryMock.findAdminByEmail.mockResolvedValue(null);

      await expect(
        adminService.loginAdmin("tanise@email.com", "123456")
      ).rejects.toThrow("E-mail ou senha inválidos");
    });

    it("deve lançar erro quando senha estiver incorreta", async () => {
      adminRepositoryMock.findAdminByEmail.mockResolvedValue({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash-senha",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      bcryptMocked.compare.mockResolvedValue(false as never);

      await expect(
        adminService.loginAdmin("tanise@email.com", "123456")
      ).rejects.toThrow("E-mail ou senha inválidos");
    });

    it("deve lançar erro quando JWT_KEY não estiver configurado", async () => {
      adminRepositoryMock.findAdminByEmail.mockResolvedValue({
        id: "1",
        nome: "Tanise",
        email: "tanise@email.com",
        senha: "hash-senha",
        role: "SUPER_ADMIN",
      } satisfies AdminMock);

      bcryptMocked.compare.mockResolvedValue(true as never);

      await expect(
        adminService.loginAdmin("tanise@email.com", "123456")
      ).rejects.toThrow("JWT_KEY não configurado");
    });
  });
});