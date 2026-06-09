import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// jwt mock must include both named export and default (used by auth.service and verificaAdminRole)
vi.mock("jsonwebtoken", () => {
  const verifyFn = vi.fn();
  const signFn = vi.fn();
  const mod = { verify: verifyFn, sign: signFn };
  return { default: mod, ...mod };
});

import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusAssinatura, StatusFatura, StatusSocio } from "@prisma/client";

import { LgpdService } from "../services/lgpd.service";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { verificaAdminRole } from "../../../middlewares/verificaAdminRole";

const jwtMocked = vi.mocked(jwt);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTxMock() {
  return {
    torcedor: { update: vi.fn() },
    assinatura: { findMany: vi.fn(), updateMany: vi.fn() },
    fatura: { updateMany: vi.fn() },
  };
}

function makePrismaMock() {
  const tx = makeTxMock();
  return {
    torcedor: { findUnique: vi.fn() },
    $transaction: vi.fn().mockImplementation((fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    _tx: tx,
  };
}

function makeAuthRepoMock() {
  return {
    findUserByEmail: vi.fn(),
    forgotPassword: vi.fn(),
    login: vi.fn(),
    recoverPassword: vi.fn(),
    resetPassword: vi.fn(),
    updatePasswordById: vi.fn(),
  };
}

const makeResponse = (): Response =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response);

// ---------------------------------------------------------------------------
// LgpdService — anonimizarTorcedor
// ---------------------------------------------------------------------------

describe("LgpdService.anonimizarTorcedor", () => {
  let prismaMock: ReturnType<typeof makePrismaMock>;
  let service: LgpdService;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock = makePrismaMock();
    service = new LgpdService(prismaMock as unknown as typeof import("../../../lib/prisma").prisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deve limpar dados pessoais após anonimização", async () => {
    const torcedorId = "uuid-1";

    prismaMock.torcedor.findUnique.mockResolvedValue({ id: torcedorId, anonimizadoEm: null });
    prismaMock._tx.assinatura.findMany.mockResolvedValue([]);
    prismaMock._tx.torcedor.update.mockResolvedValue({});

    await service.anonimizarTorcedor(torcedorId, "TITULAR");

    expect(prismaMock._tx.torcedor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: torcedorId },
        data: expect.objectContaining({
          nome: "Torcedor removido",
          email: `anon+${torcedorId}@anon.local`,
          cpf: null,
          telefone: null,
          dataNascimento: null,
          genero: null,
          fotoUrl: null,
          faceId: null,
          documentoFrenteUrl: null,
          documentoVersoUrl: null,
          enderecoLogradouro: null,
          enderecoNumero: null,
          enderecoBairro: null,
          enderecoCidade: null,
          enderecoUF: null,
          enderecoCEP: null,
          aceitaMarketing: false,
          aceitaMarketingEm: null,
          statusSocio: StatusSocio.CANCELADO,
          emailToken: null,
          emailTokenExpiraEm: null,
          senhaToken: null,
          senhaTokenExpiraEm: null,
          anonimizadoEm: expect.any(Date),
          exclusaoSolicitadaEm: expect.any(Date),
        }),
      })
    );
  });

  it("deve definir exclusaoSolicitadaEm apenas quando origem for TITULAR", async () => {
    const torcedorId = "uuid-2";

    prismaMock.torcedor.findUnique.mockResolvedValue({ id: torcedorId, anonimizadoEm: null });
    prismaMock._tx.assinatura.findMany.mockResolvedValue([]);
    prismaMock._tx.torcedor.update.mockResolvedValue({});

    await service.anonimizarTorcedor(torcedorId, "ADMIN");

    expect(prismaMock._tx.torcedor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          exclusaoSolicitadaEm: undefined,
        }),
      })
    );
  });

  it("deve cancelar assinaturas não canceladas e faturas ABERTA/ATRASADA", async () => {
    const torcedorId = "uuid-3";
    const assinaturaIds = ["assinatura-1", "assinatura-2"];

    prismaMock.torcedor.findUnique.mockResolvedValue({ id: torcedorId, anonimizadoEm: null });
    prismaMock._tx.assinatura.findMany.mockResolvedValue(assinaturaIds.map((id) => ({ id })));
    prismaMock._tx.fatura.updateMany.mockResolvedValue({ count: 1 });
    prismaMock._tx.assinatura.updateMany.mockResolvedValue({ count: 2 });
    prismaMock._tx.torcedor.update.mockResolvedValue({});

    await service.anonimizarTorcedor(torcedorId, "TITULAR");

    expect(prismaMock._tx.fatura.updateMany).toHaveBeenCalledWith({
      where: {
        assinaturaId: { in: assinaturaIds },
        status: { in: [StatusFatura.ABERTA, StatusFatura.ATRASADA] },
      },
      data: { status: StatusFatura.CANCELADA },
    });

    expect(prismaMock._tx.assinatura.updateMany).toHaveBeenCalledWith({
      where: { id: { in: assinaturaIds } },
      data: {
        status: StatusAssinatura.CANCELADA,
        canceladaEm: expect.any(Date),
        motivoCancelamento: "Anonimização LGPD",
      },
    });
  });

  it("não deve cancelar faturas PAGAS nem tocar pedidos/ingressos/pagamentos", async () => {
    const torcedorId = "uuid-4";

    prismaMock.torcedor.findUnique.mockResolvedValue({ id: torcedorId, anonimizadoEm: null });
    prismaMock._tx.assinatura.findMany.mockResolvedValue([{ id: "assinatura-ativa" }]);
    prismaMock._tx.fatura.updateMany.mockResolvedValue({ count: 0 });
    prismaMock._tx.assinatura.updateMany.mockResolvedValue({ count: 1 });
    prismaMock._tx.torcedor.update.mockResolvedValue({});

    await service.anonimizarTorcedor(torcedorId, "TITULAR");

    const [faturaCall] = prismaMock._tx.fatura.updateMany.mock.calls;
    expect(faturaCall[0].where.status.in).not.toContain(StatusFatura.PAGA);
    expect(faturaCall[0].where.status.in).not.toContain(StatusFatura.CANCELADA);

    // pedido, ingresso e pagamentoSocio não são tocados
    expect(prismaMock._tx).not.toHaveProperty("pedido");
    expect(prismaMock._tx).not.toHaveProperty("pagamentoSocio");
    expect(prismaMock._tx).not.toHaveProperty("ingresso");
  });

  it("deve ser idempotente — segunda chamada lança erro sem reprocessar", async () => {
    const torcedorId = "uuid-5";

    prismaMock.torcedor.findUnique.mockResolvedValue({
      id: torcedorId,
      anonimizadoEm: new Date(),
    });

    await expect(service.anonimizarTorcedor(torcedorId, "TITULAR")).rejects.toThrow(
      "Torcedor já anonimizado"
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando torcedor não existe", async () => {
    prismaMock.torcedor.findUnique.mockResolvedValue(null);

    await expect(service.anonimizarTorcedor("nao-existe", "ADMIN")).rejects.toThrow(
      "Torcedor não encontrado"
    );

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem de confirmação", async () => {
    const torcedorId = "uuid-6";

    prismaMock.torcedor.findUnique.mockResolvedValue({ id: torcedorId, anonimizadoEm: null });
    prismaMock._tx.assinatura.findMany.mockResolvedValue([]);
    prismaMock._tx.torcedor.update.mockResolvedValue({});

    const result = await service.anonimizarTorcedor(torcedorId, "TITULAR");

    expect(result).toEqual({ message: "Dados pessoais removidos com sucesso" });
  });
});

// ---------------------------------------------------------------------------
// AuthService — login bloqueado pós-anonimização
// ---------------------------------------------------------------------------

describe("AuthService.login — conta anonimizada", () => {
  let authRepoMock: ReturnType<typeof makeAuthRepoMock>;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authRepoMock = makeAuthRepoMock();
    authService = new AuthService(authRepoMock as unknown as AuthRepository);
    process.env.JWT_KEY = "segredo-teste";
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_KEY;
  });

  it("deve rejeitar login quando anonimizadoEm está preenchido", async () => {
    authRepoMock.findUserByEmail.mockResolvedValue({
      id: "uuid-anon",
      nome: "Torcedor removido",
      email: "anon+uuid-anon@anon.local",
      senha: "$2b$10$hash",
      anonimizadoEm: new Date(),
    });

    await expect(authService.login("email@exemplo.com", "senha")).rejects.toThrow(
      "Conta removida"
    );
  });

  it("deve permitir login quando anonimizadoEm é null", async () => {
    authRepoMock.findUserByEmail.mockResolvedValue({
      id: "uuid-ok",
      nome: "Fulano",
      email: "fulano@exemplo.com",
      senha: "minhasenha",
      anonimizadoEm: null,
    });
    authRepoMock.updatePasswordById.mockResolvedValue({});
    jwtMocked.sign.mockReturnValue("token-falso" as never);

    const result = await authService.login("fulano@exemplo.com", "minhasenha");

    expect(result).toHaveProperty("token", "token-falso");
  });
});

// ---------------------------------------------------------------------------
// verificaAdminRole middleware
// ---------------------------------------------------------------------------

describe("verificaAdminRole middleware", () => {
  const makeReq = (token?: string): Request =>
    ({
      headers: token ? { authorization: `Bearer ${token}` } : {},
    } as unknown as Request);

  const makeNext = () => vi.fn() as unknown as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_KEY;
  });

  it("deve retornar 401 sem token", () => {
    const req = makeReq();
    const res = makeResponse();
    const next = makeNext();

    verificaAdminRole(["SUPER_ADMIN"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 403 quando adminRole não é SUPER_ADMIN", () => {
    process.env.JWT_KEY = "segredo";
    jwtMocked.verify.mockReturnValue({ adminId: "adm-1", adminRole: "OPERACIONAL" } as never);

    const req = makeReq("token-valido");
    const res = makeResponse();
    const next = makeNext();

    verificaAdminRole(["SUPER_ADMIN"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 403 quando token não tem adminRole (token de torcedor)", () => {
    process.env.JWT_KEY = "segredo";
    jwtMocked.verify.mockReturnValue({ userLogadoId: "tor-1" } as never);

    const req = makeReq("token-torcedor");
    const res = makeResponse();
    const next = makeNext();

    verificaAdminRole(["SUPER_ADMIN"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve chamar next() quando adminRole é SUPER_ADMIN", () => {
    process.env.JWT_KEY = "segredo";
    jwtMocked.verify.mockReturnValue({ adminId: "adm-1", adminRole: "SUPER_ADMIN" } as never);

    const req = makeReq("token-super-admin") as Request & { userLogadoId?: string };
    const res = makeResponse();
    const next = makeNext();

    verificaAdminRole(["SUPER_ADMIN"])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.userLogadoId).toBe("adm-1");
  });

  it("deve retornar 401 para token inválido/expirado", () => {
    process.env.JWT_KEY = "segredo";
    jwtMocked.verify.mockImplementation(() => { throw new Error("jwt expired"); });

    const req = makeReq("token-expirado");
    const res = makeResponse();
    const next = makeNext();

    verificaAdminRole(["SUPER_ADMIN"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
