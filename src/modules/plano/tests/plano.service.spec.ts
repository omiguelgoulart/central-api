import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlanoRepository } from "../repositories/plano.repository";
import { PlanoService } from "../services/plano.service";


type PlanoMock = {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  periodicidade: string;
  Periodicidade: string;
};

type PlanoRepositoryMock = {
  createPlano: ReturnType<typeof vi.fn>;
  getAllPlanos: ReturnType<typeof vi.fn>;
  getPlanoById: ReturnType<typeof vi.fn>;
  deletePlano: ReturnType<typeof vi.fn>;
  updatePlano: ReturnType<typeof vi.fn>;
};

describe("PlanoService", () => {
  let planoService: PlanoService;
  let planoRepositoryMock: PlanoRepositoryMock;

  beforeEach(() => {
    planoRepositoryMock = {
      createPlano: vi.fn(),
      getAllPlanos: vi.fn(),
      getPlanoById: vi.fn(),
      deletePlano: vi.fn(),
      updatePlano: vi.fn(),
    };

    planoService = new PlanoService(
      planoRepositoryMock as unknown as PlanoRepository
    );

    vi.clearAllMocks();
  });

  describe("createPlano", () => {
    it("deve criar um plano com sucesso", async () => {
      const input: Parameters<PlanoService["createPlano"]>[0] = {
        nome: "Plano Básico",
        descricao: "Descrição do plano básico",
        valor: 29.99,
        Periodicidade: "MENSAL",
      };

      planoRepositoryMock.createPlano.mockResolvedValue({
        id: 1,
        nome: "Plano Básico",
        descricao: "Descrição do plano básico",
        valor: 29.99,
        Periodicidade: "MENSAL",
      });

      const result = await planoService.createPlano(input);

      expect(planoRepositoryMock.createPlano).toHaveBeenCalledWith(input);
      expect(result).toEqual({
        message: "Plano criado com sucesso",
        planoId: 1,
      });
    });
  });

  describe("getAllPlanos", () => {
    it("deve retornar uma lista de planos", async () => {
      const mockPlanos = [
        {
          id: 1,
          nome: "Plano Básico",
          descricao: "Descrição do plano básico",
          valor: 29.99, Periodicidade: "MENSAL"
        },
        {
          id: 2,
          nome: "Plano Premium",
          descricao: "Descrição do plano premium",
          valor: 59.99, Periodicidade: "MENSAL"
        },
      ];

      planoRepositoryMock.getAllPlanos.mockResolvedValue(mockPlanos);

      const result = await planoService.getAllPlanos();

      expect(planoRepositoryMock.getAllPlanos).toHaveBeenCalled();
      expect(result).toEqual(mockPlanos);
    });
  });

  describe("getPlanoById", () => {
    it("deve retornar um plano pelo ID", async () => {
      const mockPlano = {
        id: 1,
        nome: "Plano Básico",
        descricao: "Descrição do plano básico",
        valor: 29.99, Periodicidade: "MENSAL"
      };

      planoRepositoryMock.getPlanoById.mockResolvedValue(mockPlano);

      const result = await planoService.getPlanoById("1");

      expect(planoRepositoryMock.getPlanoById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockPlano);
    });
  });

  describe("deletePlano", () => {
    it("deve deletar um plano pelo ID", async () => {
      planoRepositoryMock.getPlanoById.mockResolvedValue({
        id: 1,
        nome: "Plano Básico",
        descricao: "Descrição do plano básico",
        valor: 29.99,
        periodicidade: "MENSAL",
        Periodicidade: "MENSAL"
      } satisfies PlanoMock);

      const result = await planoService.deletePlano("1");

      expect(planoRepositoryMock.getPlanoById).toHaveBeenCalledWith("1");
      expect(planoRepositoryMock.deletePlano).toHaveBeenCalledWith("1");
      expect(result).toEqual({ message: "Plano deletado com sucesso" });
    });
  });

  describe("updatePlano", () => {
    it("deve atualizar um plano pelo ID", async () => {
      const input: Parameters<PlanoService["updatePlano"]>[1] = {
        nome: "Plano Básico Atualizado",
        descricao: "Descrição do plano básico atualizado",
        valor: 39.99,
        Periodicidade: "MENSAL",
      };

      planoRepositoryMock.getPlanoById.mockResolvedValue({
        id: 1,
        nome: "Plano Básico",
        descricao: "Descrição do plano básico",
        valor: 29.99,
        periodicidade: "MENSAL",
        Periodicidade: "MENSAL",
      } satisfies PlanoMock);

      planoRepositoryMock.updatePlano.mockResolvedValue({
        id: 1,
        ...input,
      });

      const result = await planoService.updatePlano("1", input);

      expect(planoRepositoryMock.getPlanoById).toHaveBeenCalledWith("1");
      expect(planoRepositoryMock.updatePlano).toHaveBeenCalledWith("1", input);
      expect(result).toEqual({
        message: "Plano atualizado com sucesso",
        planoId: 1,
      });
    });
  });
});