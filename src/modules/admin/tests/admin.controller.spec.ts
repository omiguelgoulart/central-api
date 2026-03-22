import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { ZodError } from "zod";
import { Request, Response } from "express";

import { AdminController } from "../controllers/admin.controller";
import { AdminService } from "../services/admin.service";

describe("AdminController", () => {
    let adminServiceMock: {
        createAdmin: ReturnType<typeof vi.fn>;
        getAllAdmins: ReturnType<typeof vi.fn>;
        getAdminById: ReturnType<typeof vi.fn>;
        deleteAdmin: ReturnType<typeof vi.fn>;
        updateAdmin: ReturnType<typeof vi.fn>;
        loginAdmin: ReturnType<typeof vi.fn>;
    };

    let adminController: AdminController;

    const makeResponse = (): Response =>
    ({
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    } as unknown as Response);

    beforeEach(() => {
        adminServiceMock = {
            createAdmin: vi.fn(),
            getAllAdmins: vi.fn(),
            getAdminById: vi.fn(),
            deleteAdmin: vi.fn(),
            updateAdmin: vi.fn(),
            loginAdmin: vi.fn(),
        };

        adminController = new AdminController(
            adminServiceMock as unknown as AdminService
        );

        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    describe("createAdmin", () => {
        it("deve retornar 201 ao criar administrador com sucesso", async () => {
            const req = {
                body: {
                    nome: "novo",
                    email: "novo@email.com",
                    senha: "12345678",
                    role: "SUPER_ADMIN",
                },
            } as Request;

            const res = makeResponse();

            adminServiceMock.createAdmin.mockResolvedValue({
                message: "Admin criado com sucesso",
                adminId: "1",
            });

            await adminController.createAdmin(req, res);

            expect(adminServiceMock.createAdmin).toHaveBeenCalledWith({
                nome: "novo",
                email: "novo@email.com",
                senha: "12345678",
                role: "SUPER_ADMIN",
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Admin criado com sucesso",
                adminId: "1",
            });
        });

        it("deve retornar 400 quando houver erro de validação", async () => {
            const req = {
                body: {
                    nome: "",
                    email: "email-invalido",
                },
            } as Request;

            const res = makeResponse();

            await adminController.createAdmin(req, res);

            expect(adminServiceMock.createAdmin).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
        });

        it("deve retornar 500 quando ocorrer erro interno", async () => {
            const req = {
                body: {
                    nome: "novo",
                    email: "novo@email.com",
                    senha: "12345678",
                    role: "SUPER_ADMIN",
                },
            } as Request;

            const res = makeResponse();

            adminServiceMock.createAdmin.mockRejectedValue(new Error("Erro interno"));

            await adminController.createAdmin(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Erro ao criar administrador",
                detalhe: "Error: Erro interno",
            });
        });
    });

    describe("getAllAdmins", () => {
        it("deve retornar 200 ao buscar todos os administradores", async () => {
            const req = {} as Request;
            const res = makeResponse();

            adminServiceMock.getAllAdmins.mockResolvedValue([
                {
                    id: "1",
                    nome: "Admin 1",
                    email: "admin1@email.com",
                    role: "SUPER_ADMIN",
                },
            ]);

            await adminController.getAllAdmins(req, res);

            expect(adminServiceMock.getAllAdmins).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([
                {
                    id: "1",
                    nome: "Admin 1",
                    email: "admin1@email.com",
                    role: "SUPER_ADMIN",
                },
            ]);
        });

        it("deve retornar 500 quando ocorrer erro ao buscar todos os administradores", async () => {
            const req = {} as Request;
            const res = makeResponse();

            adminServiceMock.getAllAdmins.mockRejectedValue(new Error("Erro interno"));

            await adminController.getAllAdmins(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Erro ao buscar administradores",
                detalhe: "Error: Erro interno",
            });
        });
    });

    describe("getAdminbyId", () => {
        it("deve retornar 200 ao buscar administrador por id", async () => {
            const req = {
                params: { id: "1" },
            } as unknown as Request;

            const res = makeResponse();

            adminServiceMock.getAdminById.mockResolvedValue({
                id: "1",
                nome: "novo",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
            });

            await adminController.getAdminbyId(req, res);

            expect(adminServiceMock.getAdminById).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: "1",
                nome: "novo",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
            });
        });

        it("deve retornar 500 quando ocorrer erro ao buscar administrador por id", async () => {
            const req = {
                params: { id: "1" },
            } as unknown as Request;

            const res = makeResponse();

            adminServiceMock.getAdminById.mockRejectedValue(new Error("Erro interno"));

            await adminController.getAdminbyId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Erro ao buscar administrador",
                detalhe: "Error: Erro interno",
            });
        });
    });

    describe("deleteAdmin", () => {
        it("deve retornar 200 ao deletar administrador", async () => {
            const req = {
                params: { id: "1" },
            } as unknown as Request;

            const res = makeResponse();

            adminServiceMock.deleteAdmin.mockResolvedValue({
                message: "Admin deletado com sucesso",
            });

            await adminController.deleteAdmin(req, res);

            expect(adminServiceMock.deleteAdmin).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Admin deletado com sucesso",
            });
        });

        it("deve retornar 500 quando ocorrer erro ao deletar administrador", async () => {
            const req = {
                params: { id: "1" },
            } as unknown as Request;

            const res = makeResponse();

            adminServiceMock.deleteAdmin.mockRejectedValue(new Error("Erro interno"));

            await adminController.deleteAdmin(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Erro ao deletar administrador",
                detalhe: "Error: Erro interno",
            });
        });
    });

    describe("updateAdmin", () => {
        it("deve retornar 200 ao atualizar administrador com sucesso", async () => {
            const req = {
                params: { id: "1" },
                body: {
                    nome: "Novo Nome",
                    email: "novo@email.com",
                    role: "SUPER_ADMIN",
                },
            } as unknown as Request;

            const res = makeResponse();

            adminServiceMock.updateAdmin.mockResolvedValue({
                id: "1",
                nome: "Novo Nome",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
            });

            await adminController.updateAdmin(req, res);

            expect(adminServiceMock.updateAdmin).toHaveBeenCalledWith("1", {
                nome: "Novo Nome",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: "1",
                nome: "Novo Nome",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
            });
        });

        it("deve retornar 400 quando houver erro de validação no update", async () => {
            const req = {
                params: { id: "1" },
                body: {
                    email: "email-invalido",
                },
            } as unknown as Request;

            const res = makeResponse();

            await adminController.updateAdmin(req, res);

            expect(adminServiceMock.updateAdmin).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
        });

        it("deve retornar 500 quando ocorrer erro interno no update", async () => {
            const req = {
                params: { id: "1" },
                body: {
                    nome: "Novo Nome",
                    email: "novo@email.com",
                    role: "SUPER_ADMIN",
                },
            } as unknown as Request;

            const res = makeResponse();

            adminServiceMock.updateAdmin.mockRejectedValue(new Error("Erro interno"));

            await adminController.updateAdmin(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Erro ao atualizar administrador",
                detalhe: "Error: Erro interno",
            });
        });
    });

    describe("loginAdmin", () => {
        it("deve retornar 200 ao realizar login com sucesso", async () => {
            const req = {
                body: {
                    email: "novo@email.com",
                    senha: "123456",
                },
            } as Request;

            const res = makeResponse();

            adminServiceMock.loginAdmin.mockResolvedValue({
                id: "1",
                nome: "novo",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
                token: "token-falso",
            });

            await adminController.loginAdmin(req, res);

            expect(adminServiceMock.loginAdmin).toHaveBeenCalledWith(
                "novo@email.com",
                "123456"
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: "1",
                nome: "novo",
                email: "novo@email.com",
                role: "SUPER_ADMIN",
                token: "token-falso",
            });
        });

        it("deve retornar 500 quando ocorrer erro no login", async () => {
            const req = {
                body: {
                    email: "novo@email.com",
                    senha: "123456",
                },
            } as Request;

            const res = makeResponse();

            adminServiceMock.loginAdmin.mockRejectedValue(new Error("Erro interno"));

            await adminController.loginAdmin(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Erro ao realizar login",
                detalhe: "Error: Erro interno",
            });
        });
    });
});