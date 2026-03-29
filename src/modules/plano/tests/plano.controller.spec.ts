import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { Request, Response } from "express";

import { PlanoController } from "../controllers/plano.controller";
import { PlanoService } from "../services/plano.service";

describe("PlanoController", () => {
    let planoServiceMock: Partial<PlanoService>;
    let planoController: PlanoController;

    const makeResponse = (): Response => ({
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    } as unknown as Response);

    beforeEach(() => {
        planoServiceMock = {
            createPlano: vi.fn(),
            getAllPlanos: vi.fn(),
            getPlanoById: vi.fn(),
            updatePlano: vi.fn(),
            deletePlano: vi.fn(),
        };

        planoController = new PlanoController(
            planoServiceMock as unknown as PlanoService
        );

        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it("deve retornar 201 ao criar plano", async () => {
        const planoData = {
            nome: "Plano Básico",
            descricao: "Descrição do plano básico",
            valor: 29.99,
            Periodicidade: "MENSAL",
        };

        const req = {
            body: {
                ...planoData
            },
        } as Request;

        const res = makeResponse();

        planoServiceMock.createPlano = vi.fn().mockResolvedValue({
            message: "Plano criado com sucesso",
            planoId: 1,
        });

        await planoController.createPlano(req, res);

        expect(planoServiceMock.createPlano).toHaveBeenCalledWith(planoData);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Plano criado com sucesso",
            planoId: 1,
        });
    });

    it("deve retornar 200 ao atualizar plano", async () => {
        const planoData = {
            nome: "Plano Premium",
            descricao: "Descrição do plano premium",
            valor: 59.99,
            Periodicidade: "MENSAL",
        };

        const req = {
            params: { id: "1" },
            body: {
                ...planoData
            },
        } as unknown as Request;

        const res = makeResponse();

        planoServiceMock.getPlanoById = vi.fn().mockResolvedValue({
            id: 1,
            ...planoData,
        });
        planoServiceMock.updatePlano = vi.fn().mockResolvedValue({
            message: "Plano atualizado com sucesso",
            planoId: 1,
        });

        await planoController.updatePlano(req, res);

        expect(planoServiceMock.updatePlano).toHaveBeenCalledWith("1", planoData);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Plano atualizado com sucesso",
            planoId: 1,
        });
    });

    it("deve retornar 400 ao atualizar plano com dados inválidos", async () => {
        const req = {
            params: { id: "1" },
            body: {
                nome: "", // Nome inválido
                descricao: "Descrição do plano",
                valor: -10, // Valor inválido
                Periodicidade: "MENSAL",
            },
        } as unknown as Request;

        const res = makeResponse();

        await planoController.updatePlano(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.any(Array),
        }));
    });

    it("deve retornar 500 ao ocorrer erro no serviço ao atualizar plano", async () => {
        const req = {
            params: { id: "1" },
            body: {
                nome: "Plano Premium",
                descricao: "Descrição do plano premium",
                valor: 59.99,
                Periodicidade: "MENSAL",
            },
        } as unknown as Request;

        const res = makeResponse();

        planoServiceMock.getPlanoById = vi.fn().mockResolvedValue({
            id: 1,
            nome: "Plano Básico",
            descricao: "Descrição do plano básico",
            valor: 29.99,
            Periodicidade: "MENSAL",
        });
        planoServiceMock.updatePlano = vi.fn().mockRejectedValue(new Error("Erro ao atualizar plano"));

        await planoController.updatePlano(req, res);

        expect(planoServiceMock.updatePlano).toHaveBeenCalledWith("1", req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Erro ao atualizar plano",
            detalhe: "Error: Erro ao atualizar plano",
        });
    });
});