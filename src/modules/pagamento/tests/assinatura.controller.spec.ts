import { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AssinaturaController } from "../controllers/assinatura.controller";
import { AssinaturaService } from "../services/assinatura.service";

describe("AssinaturaController", () => {
  let assinaturaServiceMock: Partial<AssinaturaService>;
  let assinaturaController: AssinaturaController;

  const makeResponse = (): Response => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response);

  beforeEach(() => {
    assinaturaServiceMock = {
      createAssinatura: vi.fn(),
      getAllAssinaturas: vi.fn(),
      getAssinaturaById: vi.fn(),
      deleteAssinatura: vi.fn(),
      updateAssinatura: vi.fn(),
    };

    assinaturaController = new AssinaturaController(
      assinaturaServiceMock as unknown as AssinaturaService
    );

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("createAssinatura", () => {
    it("deve retornar 201 ao criar assinatura", async () => {
      const req = {
        userLogadoId: "torcedor-1",
        body: { planoId: "plano-1", inicioEm: "2025-01-01" },
      } as unknown as Request;
      const res = makeResponse();

      assinaturaServiceMock.createAssinatura = vi.fn().mockResolvedValue({
        id: "assinatura-1",
      });

      await assinaturaController.createAssinatura(req, res);

      expect(assinaturaServiceMock.createAssinatura).toHaveBeenCalledWith(
        expect.objectContaining({
          torcedorId: "torcedor-1",
          planoId: "plano-1",
          status: "ATIVA",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "assinatura-1" });
    });

    it("deve retornar 401 se o usuário nao estiver autenticado", async () => {
      const req = {
        body: { planoId: "plano-1", inicioEm: "2025-01-01" },
      } as unknown as Request;
      const res = makeResponse();

      await assinaturaController.createAssinatura(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuário não autenticado" });
      expect(assinaturaServiceMock.createAssinatura).not.toHaveBeenCalled();
    });

    it("deve retornar 400 ao receber corpo inválido (ZodError)", async () => {
      const req = {
        userLogadoId: "torcedor-1",
        body: {},
      } as unknown as Request;
      const res = makeResponse();

      await assinaturaController.createAssinatura(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
    });

    it("deve retornar 400 quando o serviço lançar 'nao encontrado'", async () => {
      const req = {
        userLogadoId: "torcedor-1",
        body: { planoId: "plano-1", inicioEm: "2025-01-01" },
      } as unknown as Request;
      const res = makeResponse();

      assinaturaServiceMock.createAssinatura = vi
        .fn()
        .mockRejectedValue(new Error("Plano nao encontrado"));

      await assinaturaController.createAssinatura(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Plano nao encontrado" });
    });

    it("deve retornar 500 em erro inesperado do serviço", async () => {
      const req = {
        userLogadoId: "torcedor-1",
        body: { planoId: "plano-1", inicioEm: "2025-01-01" },
      } as unknown as Request;
      const res = makeResponse();

      assinaturaServiceMock.createAssinatura = vi
        .fn()
        .mockRejectedValue(new Error("Falha no banco"));

      await assinaturaController.createAssinatura(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao criar assinatura" });
    });
  });

  describe("getAllAssinaturas", () => {
    it("deve retornar 200 com a lista", async () => {
      const res = makeResponse();
      assinaturaServiceMock.getAllAssinaturas = vi
        .fn()
        .mockResolvedValue([{ id: "1" }]);

      await assinaturaController.getAllAssinaturas(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: "1" }]);
    });

    it("deve retornar 500 em erro do serviço", async () => {
      const res = makeResponse();
      assinaturaServiceMock.getAllAssinaturas = vi
        .fn()
        .mockRejectedValue(new Error("Falha"));

      await assinaturaController.getAllAssinaturas(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao buscar assinaturas" });
    });
  });

  describe("getAssinaturaById", () => {
    it("deve retornar 200 com a assinatura", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = makeResponse();
      assinaturaServiceMock.getAssinaturaById = vi
        .fn()
        .mockResolvedValue({ id: "1" });

      await assinaturaController.getAssinaturaById(req, res);

      expect(assinaturaServiceMock.getAssinaturaById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1" });
    });

    it("deve retornar 404 quando nao encontrada", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = makeResponse();
      assinaturaServiceMock.getAssinaturaById = vi
        .fn()
        .mockRejectedValue(new Error("Assinatura nao encontrada"));

      await assinaturaController.getAssinaturaById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assinatura nao encontrada" });
    });
  });

  describe("deleteAssinatura", () => {
    it("deve retornar 200 ao deletar", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = makeResponse();
      assinaturaServiceMock.deleteAssinatura = vi
        .fn()
        .mockResolvedValue({ message: "Assinatura deletada com sucesso" });

      await assinaturaController.deleteAssinatura(req, res);

      expect(assinaturaServiceMock.deleteAssinatura).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assinatura deletada com sucesso",
      });
    });

    it("deve retornar 404 quando nao encontrada", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = makeResponse();
      assinaturaServiceMock.deleteAssinatura = vi
        .fn()
        .mockRejectedValue(new Error("Assinatura nao encontrada"));

      await assinaturaController.deleteAssinatura(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assinatura nao encontrada" });
    });
  });

  describe("updateAssinatura", () => {
    it("deve retornar 200 ao atualizar", async () => {
      const req = {
        params: { id: "1" },
        body: { status: "SUSPENSA" },
      } as unknown as Request;
      const res = makeResponse();
      assinaturaServiceMock.updateAssinatura = vi
        .fn()
        .mockResolvedValue({ message: "Assinatura atualizada com sucesso" });

      await assinaturaController.updateAssinatura(req, res);

      expect(assinaturaServiceMock.updateAssinatura).toHaveBeenCalledWith("1", {
        status: "SUSPENSA",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assinatura atualizada com sucesso",
      });
    });

    it("deve retornar 404 quando nao encontrada", async () => {
      const req = {
        params: { id: "1" },
        body: { status: "SUSPENSA" },
      } as unknown as Request;
      const res = makeResponse();
      assinaturaServiceMock.updateAssinatura = vi
        .fn()
        .mockRejectedValue(new Error("Assinatura nao encontrada"));

      await assinaturaController.updateAssinatura(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Assinatura nao encontrada" });
    });
  });
});