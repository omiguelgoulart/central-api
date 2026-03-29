import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { BeneficioService } from "../services/beneficio.service";
import { BeneficioRepository } from "../repositories/beneficio.repository";

type BeneficioMock = {
    id: number;
    slug: string;
    titulo: string;
    ativo: boolean;
    planoId: string;
    ordem: number;
    destaque: boolean;
};

type BeneficioRepositoryMock = {
    createBeneficio: ReturnType<typeof vi.fn>;
    getAllBeneficios: ReturnType<typeof vi.fn>;
    getBeneficioById: ReturnType<typeof vi.fn>;
    deleteBeneficio: ReturnType<typeof vi.fn>;
    updateBeneficio: ReturnType<typeof vi.fn>;
};

describe("BeneficioService", () => {
    let beneficioService: BeneficioService;
    let beneficioRepositoryMock: BeneficioRepositoryMock;

    beforeEach(() => {
        beneficioRepositoryMock = {
            createBeneficio: vi.fn(),
            getAllBeneficios: vi.fn(),
            getBeneficioById: vi.fn(),
            deleteBeneficio: vi.fn(),
            updateBeneficio: vi.fn(),
        };

        beneficioService = new BeneficioService(
            beneficioRepositoryMock as unknown as BeneficioRepository
        );

        vi.clearAllMocks();
    });

    describe("createBeneficio", () => {

        it("deve criar um benefício com sucesso", async () => {
            const input: Parameters<BeneficioService["createBeneficio"]>[0] = {
                slug: "beneficio-novo",
                titulo: "Benefício Novo",
                ativo: true,
                planoId: "1",
                destaque: true,
            };
            beneficioRepositoryMock.createBeneficio.mockResolvedValue({
                id: 1,
                ...input,
            });
            const result = await beneficioService.createBeneficio(input);

            expect(beneficioRepositoryMock.createBeneficio).toHaveBeenCalledWith(input);
            expect(result).toEqual({
                message: "Benefício criado com sucesso",
                beneficioId: 1,
            });
        });
    });

    describe("getAllBeneficios", () => {
        it("deve retornar uma lista de benefícios", async () => {
            const mokBeneficios = [
                {
                    id: 1,
                    slug: "beneficio-1",
                    titulo: "Benefício 1",
                    ativo: true,
                    planoId: "1",
                    ordem: 1,
                    destaque: true,
                },
                {
                    id: 2,
                    slug: "beneficio-2",
                    titulo: "Benefício 2",
                    ativo: false,
                    planoId: "2",
                    ordem: 2,
                    destaque: false,
                },
            ];

            beneficioRepositoryMock.getAllBeneficios.mockResolvedValue(mokBeneficios);

            const result = await beneficioService.getAllBeneficios();
            expect(beneficioRepositoryMock.getAllBeneficios).toHaveBeenCalled();
            expect(result).toEqual(mokBeneficios);
        });
    });

    describe("getBeneficioById", () => {
        it("deve retornar um benefício pelo ID", async () => {
            const mockBeneficio = {
                id: 1,
                slug: "beneficio-1",
                titulo: "Benefício 1",
                ativo: true,
                planoId: "1",
                ordem: 1,
                destaque: true,
            };

            beneficioRepositoryMock.getBeneficioById.mockResolvedValue(mockBeneficio);

            const result = await beneficioService.getBeneficioById("1");
            expect(beneficioRepositoryMock.getBeneficioById).toHaveBeenCalledWith("1");
            expect(result).toEqual(mockBeneficio);
        });
    });

    describe("deleteBeneficio", () => {
        it("deve deletar um benefício com sucesso", async () => {
            beneficioRepositoryMock.getBeneficioById.mockResolvedValue({
                id: 1,
                slug: "beneficio-1",
                titulo: "Benefício 1",
                ativo: true,
                planoId: "1",
                ordem: 1,
                destaque: true,
            });
            const result = await beneficioService.deleteBeneficio("1");

            expect(beneficioRepositoryMock.getBeneficioById).toHaveBeenCalledWith("1");
            expect(beneficioRepositoryMock.deleteBeneficio).toHaveBeenCalledWith("1");
            expect(result).toEqual({
                message: "Benefício deletado com sucesso",
            });
        });
    });

    describe("updateBeneficio", () => {
        it("deve atualizar um benefício com sucesso", async () => {
            const input: Parameters<BeneficioService["updateBeneficio"]>[1] = {
                slug: "beneficio-atualizado",
                titulo: "Benefício Atualizado",
                ativo: false,
                planoId: "2",
                destaque: false,
            };

            beneficioRepositoryMock.getBeneficioById.mockResolvedValue({
                id: 1,
                slug: "beneficio-antigo",
                titulo: "Benefício Antigo",
                ativo: true,
                planoId: "1",
                destaque: true,
            });

            beneficioRepositoryMock.updateBeneficio.mockResolvedValue({
                id: 1,
                ...input,
            });

            const result = await beneficioService.updateBeneficio("1", input);

            expect(beneficioRepositoryMock.updateBeneficio).toHaveBeenCalledWith("1", input);
            expect(result).toEqual({
                message: "Benefício atualizado com sucesso",
                beneficioId: 1,
            });
        });
    });

});
