import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { Request, Response } from "express";

import { BeneficioController } from "../controllers/beneficio.controller";
import { BeneficioService } from "../services/beneficio.service";

describe("BeneficioController", () => {
    let beneficioServiceMock: Partial<BeneficioService>;
    let beneficioController: BeneficioController;

    const makeResponse = (): Response => ({
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    } as unknown as Response);

    beforeEach(() => {
        beneficioServiceMock = {
            createBeneficio: vi.fn(),
            getAllBeneficios: vi.fn(),
            getBeneficioById: vi.fn(),
            updateBeneficio: vi.fn(),
            deleteBeneficio: vi.fn(),
        };

        beneficioController = new BeneficioController(
            beneficioServiceMock as unknown as BeneficioService
        );

        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it("deve retornar 201 ao criar benefício", async () => {
        const beneficioData = {
            slug: "beneficio-novo",
            titulo: "Benefício Novo",
            ativo: true,
            planoId: "1",
            destaque: true,
        };
        const req = {
            body: {
                ...beneficioData
            },
        } as Request;

        const res = makeResponse();

        beneficioServiceMock.createBeneficio = vi.fn().mockResolvedValue({
            message: "Benefício criado com sucesso",
            beneficioId: 1,
        });

        await beneficioController.createBeneficio(req, res);

        expect(beneficioServiceMock.createBeneficio).toHaveBeenCalledWith(beneficioData);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("deve retornar 200 ao atualizar benefício", async () => {
        const beneficioData = {
            slug: "beneficio-atualizado",
            titulo: "Benefício Atualizado",
            ativo: false,
            planoId: "1",
            destaque: false,
        };
        const req = {
            params: { id: "1" },
            body: {
                ...beneficioData
            },
        } as unknown as Request;
        const res = makeResponse();

        beneficioServiceMock.updateBeneficio = vi.fn().mockResolvedValue({
            message: "Benefício atualizado com sucesso",
            beneficioId: 1,
        });

        await beneficioController.updateBeneficio(req, res);

        expect(beneficioServiceMock.updateBeneficio).toHaveBeenCalledWith("1", beneficioData);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deve retornar 400 ao atualizar benefício com dados inválidos", async () => {
        const req = {
            params: { id: "1" },
            body: {
                slug: "",
                titulo: "",
                ativo: false,
                planoId: "",
                destaque: false,
            },
        } as unknown as Request;
        const res = makeResponse();

        await beneficioController.updateBeneficio(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
    });

    it("deve retornar 500 ao ocorrer erro inesperado na atualização", async () => {
        const req = {
            params: { id: "1" },
            body: {
                slug: "beneficio-atualizado",
                titulo: "Benefício Atualizado",
                ativo: false,
                planoId: "1",
                destaque: false,
            },
        } as unknown as Request;
        const res = makeResponse();

        beneficioServiceMock.updateBeneficio = vi.fn().mockRejectedValue(new Error("Erro inesperado"));

        await beneficioController.updateBeneficio(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();
    });

    it("deve retornar 200 ao buscar todos os benefícios", async () => {
        const res = makeResponse();
        const beneficios = [
            { id: 1, slug: "beneficio-1", titulo: "Benefício 1" },
            { id: 2, slug: "beneficio-2", titulo: "Benefício 2" },
        ];

        beneficioServiceMock.getAllBeneficios = vi.fn().mockResolvedValue(beneficios);

        await beneficioController.getAllBeneficios({} as Request, res);

        expect(beneficioServiceMock.getAllBeneficios).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(beneficios);
    });

    it("deve retornar 200 ao buscar benefício por ID", async () => {
        const req = { params: { id: "1" } } as unknown as Request;
        const res = makeResponse();
        const beneficio = { id: 1, slug: "beneficio-1", titulo: "Benefício 1" };

        beneficioServiceMock.getBeneficioById = vi.fn().mockResolvedValue(beneficio);

        await beneficioController.getBeneficioById(req, res);

        expect(beneficioServiceMock.getBeneficioById).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(beneficio);
    });

    it("deve retornar 200 ao deletar benefício", async () => {
        const req = { params: { id: "1" } } as unknown as Request;
        const res = makeResponse();

        beneficioServiceMock.deleteBeneficio = vi.fn().mockResolvedValue({ message: "Benefício deletado com sucesso" });

        await beneficioController.deleteBeneficio(req, res);

        expect(beneficioServiceMock.deleteBeneficio).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
    });

    it("deve retornar 500 ao criar benefício com erro inesperado", async () => {
        const req = {
            body: {
                slug: "novo",
                titulo: "Novo",
                ativo: true,
                planoId: "1",
                destaque: false,
            },
        } as Request;
        const res = makeResponse();

        beneficioServiceMock.createBeneficio = vi.fn().mockRejectedValue(new Error("Erro no banco"));

        await beneficioController.createBeneficio(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();
    });
});