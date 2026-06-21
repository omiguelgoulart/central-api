import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssinaturaRepository } from "../repositories/assinatura.repository";
import { AssinaturaService } from "../services/assinatura.service";

// Mocka o envio de e-mail e os templates para nao disparar e-mail real
vi.mock("../../emails/services/email.service", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../emails/email-templates/assinatura-criada.template", () => ({
  assinaturaCriadaTemplate: vi.fn().mockReturnValue("<html>criada</html>"),
}));
vi.mock("../../emails/email-templates/assinatura-cancelada.template", () => ({
  assinaturaCanceladaTemplate: vi.fn().mockReturnValue("<html>cancelada</html>"),
}));

type AssinaturaRepositoryMock = {
  getTorcedorById: ReturnType<typeof vi.fn>;
  getPlanoById: ReturnType<typeof vi.fn>;
  createAssinatura: ReturnType<typeof vi.fn>;
  getAllAssinaturas: ReturnType<typeof vi.fn>;
  getAssinaturaById: ReturnType<typeof vi.fn>;
  getAssinaturaDetalheById: ReturnType<typeof vi.fn>;
  deleteAssinatura: ReturnType<typeof vi.fn>;
  updateAssinatura: ReturnType<typeof vi.fn>;
  getAssinaturaComTorcedor: ReturnType<typeof vi.fn>;
};

describe("AssinaturaService", () => {
  let assinaturaService: AssinaturaService;
  let assinaturaRepositoryMock: AssinaturaRepositoryMock;

  beforeEach(() => {
    assinaturaRepositoryMock = {
      getTorcedorById: vi.fn(),
      getPlanoById: vi.fn(),
      createAssinatura: vi.fn(),
      getAllAssinaturas: vi.fn(),
      getAssinaturaById: vi.fn(),
      getAssinaturaDetalheById: vi.fn(),
      deleteAssinatura: vi.fn(),
      updateAssinatura: vi.fn(),
      getAssinaturaComTorcedor: vi.fn(),
    };

    assinaturaService = new AssinaturaService(
      assinaturaRepositoryMock as unknown as AssinaturaRepository
    );

    vi.clearAllMocks();
  });

  describe("createAssinatura", () => {
    const input = {
      torcedorId: "torcedor-1",
      planoId: "plano-1",
      status: "ATIVA" as const,
      inicioEm: "2025-01-01",
    };

    it("deve criar uma assinatura com sucesso", async () => {
      assinaturaRepositoryMock.getTorcedorById.mockResolvedValue({
        id: "torcedor-1",
        nome: "Miguel",
        email: "miguel@email.com",
      });
      assinaturaRepositoryMock.getPlanoById.mockResolvedValue({
        id: "plano-1",
        nome: "Plano Ouro",
        valor: 50,
      });
      assinaturaRepositoryMock.createAssinatura.mockResolvedValue({
        id: "assinatura-1",
        ...input,
      });

      const result = await assinaturaService.createAssinatura(input);

      expect(assinaturaRepositoryMock.getTorcedorById).toHaveBeenCalledWith("torcedor-1");
      expect(assinaturaRepositoryMock.getPlanoById).toHaveBeenCalledWith("plano-1");
      // gera 12 faturas anuais
      expect(assinaturaRepositoryMock.createAssinatura).toHaveBeenCalledWith(
        input,
        expect.arrayContaining([
          expect.objectContaining({ status: "ABERTA", valor: 50 }),
        ])
      );
      expect(result).toEqual({ id: "assinatura-1", ...input });
    });

    it("deve gerar exatamente 12 faturas", async () => {
      assinaturaRepositoryMock.getTorcedorById.mockResolvedValue({
        id: "torcedor-1", nome: "Miguel", email: "miguel@email.com",
      });
      assinaturaRepositoryMock.getPlanoById.mockResolvedValue({
        id: "plano-1", nome: "Plano Ouro", valor: 50,
      });
      assinaturaRepositoryMock.createAssinatura.mockResolvedValue({ id: "assinatura-1" });

      await assinaturaService.createAssinatura(input);

      const faturasArg = assinaturaRepositoryMock.createAssinatura.mock.calls[0][1];
      expect(faturasArg).toHaveLength(12);
    });

    it("deve lançar erro se torcedor nao for encontrado", async () => {
      assinaturaRepositoryMock.getTorcedorById.mockResolvedValue(null);

      await expect(assinaturaService.createAssinatura(input)).rejects.toThrow(
        "Torcedor nao encontrado"
      );
      expect(assinaturaRepositoryMock.createAssinatura).not.toHaveBeenCalled();
    });

    it("deve lançar erro se plano nao for encontrado", async () => {
      assinaturaRepositoryMock.getTorcedorById.mockResolvedValue({
        id: "torcedor-1", nome: "Miguel", email: "miguel@email.com",
      });
      assinaturaRepositoryMock.getPlanoById.mockResolvedValue(null);

      await expect(assinaturaService.createAssinatura(input)).rejects.toThrow(
        "Plano nao encontrado"
      );
      expect(assinaturaRepositoryMock.createAssinatura).not.toHaveBeenCalled();
    });
  });

  describe("getAllAssinaturas", () => {
    it("deve retornar a lista de assinaturas", async () => {
      const mock = [{ id: "1" }, { id: "2" }];
      assinaturaRepositoryMock.getAllAssinaturas.mockResolvedValue(mock);

      const result = await assinaturaService.getAllAssinaturas();

      expect(assinaturaRepositoryMock.getAllAssinaturas).toHaveBeenCalled();
      expect(result).toEqual(mock);
    });
  });

  describe("getAssinaturaById", () => {
    it("deve retornar a assinatura pelo ID", async () => {
      const mock = { id: "1", torcedor: {}, plano: {} };
      assinaturaRepositoryMock.getAssinaturaDetalheById.mockResolvedValue(mock);

      const result = await assinaturaService.getAssinaturaById("1");

      expect(assinaturaRepositoryMock.getAssinaturaDetalheById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mock);
    });

    it("deve lançar erro se a assinatura nao existir", async () => {
      assinaturaRepositoryMock.getAssinaturaDetalheById.mockResolvedValue(null);

      await expect(assinaturaService.getAssinaturaById("1")).rejects.toThrow(
        "Assinatura nao encontrada"
      );
    });
  });

  describe("deleteAssinatura", () => {
    it("deve deletar a assinatura com sucesso", async () => {
      assinaturaRepositoryMock.getAssinaturaById.mockResolvedValue({ id: "1" });

      const result = await assinaturaService.deleteAssinatura("1");

      expect(assinaturaRepositoryMock.getAssinaturaById).toHaveBeenCalledWith("1");
      expect(assinaturaRepositoryMock.deleteAssinatura).toHaveBeenCalledWith("1");
      expect(result).toEqual({ message: "Assinatura deletada com sucesso" });
    });

    it("deve lançar erro se a assinatura nao existir", async () => {
      assinaturaRepositoryMock.getAssinaturaById.mockResolvedValue(null);

      await expect(assinaturaService.deleteAssinatura("1")).rejects.toThrow(
        "Assinatura nao encontrada"
      );
      expect(assinaturaRepositoryMock.deleteAssinatura).not.toHaveBeenCalled();
    });
  });

  describe("updateAssinatura", () => {
    it("deve atualizar a assinatura com sucesso", async () => {
      assinaturaRepositoryMock.getAssinaturaById.mockResolvedValue({ id: "1" });

      const result = await assinaturaService.updateAssinatura("1", { status: "SUSPENSA" });

      expect(assinaturaRepositoryMock.getAssinaturaById).toHaveBeenCalledWith("1");
      expect(assinaturaRepositoryMock.updateAssinatura).toHaveBeenCalledWith("1", {
        status: "SUSPENSA",
      });
      expect(result).toEqual({ message: "Assinatura atualizada com sucesso" });
    });

    it("deve lançar erro se a assinatura nao existir", async () => {
      assinaturaRepositoryMock.getAssinaturaById.mockResolvedValue(null);

      await expect(
        assinaturaService.updateAssinatura("1", { status: "SUSPENSA" })
      ).rejects.toThrow("Assinatura nao encontrada");
      expect(assinaturaRepositoryMock.updateAssinatura).not.toHaveBeenCalled();
    });

    it("deve enviar e-mail ao cancelar a assinatura", async () => {
      assinaturaRepositoryMock.getAssinaturaById.mockResolvedValue({ id: "1" });
      assinaturaRepositoryMock.getAssinaturaComTorcedor.mockResolvedValue({
        torcedor: { nome: "Miguel", email: "miguel@email.com" },
        plano: { nome: "Plano Ouro" },
      });

      const result = await assinaturaService.updateAssinatura("1", {
        status: "CANCELADA",
        motivoCancelamento: "Pedido do torcedor",
      });

      expect(assinaturaRepositoryMock.getAssinaturaComTorcedor).toHaveBeenCalledWith("1");
      expect(result).toEqual({ message: "Assinatura atualizada com sucesso" });
    });
  });
});