import { prisma } from "../../../lib/prisma";
import { CreateUsuarioInput, UpdateUsuarioInput } from "../types/users.type";
import { cp } from "fs";

export class UserModel {
    async createUser(data: CreateUsuarioInput) {
        return prisma.torcedor.create({
            data: {
                matricula: String(data.matricula),
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                cpf: data.cpf,
                telefone: data.telefone,
                enderecoLogradouro: data.enderecoLogradouro,
                enderecoNumero: data.enderecoNumero,
                enderecoBairro: data.enderecoBairro,
                enderecoCidade: data.enderecoCidade,
                enderecoUF: data.enderecoUF,
                enderecoCEP: data.enderecoCEP,
            },
        });
    }

    async getAllUsers() {
        return prisma.torcedor.findMany();
    }

    async getUserById(id: string) {
        return prisma.torcedor.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(email: string) {
        return prisma.torcedor.findUnique({
            where: { email },
        });
    }

    async getUserByMatricula(matricula: string) {
        return prisma.torcedor.findUnique({
            where: { matricula },
        });
    }

    async deleteUser(id: string) {
        return prisma.torcedor.delete({
            where: { id },
        });
    }

    async updateUser(id: string, data: UpdateUsuarioInput) {
        return prisma.torcedor.update({
            where: { id },
            data: {
                matricula: data.matricula ? String(data.matricula) : undefined,
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                cpf: data.cpf,
                telefone: data.telefone,
                enderecoLogradouro: data.enderecoLogradouro,
                enderecoNumero: data.enderecoNumero,
                enderecoBairro: data.enderecoBairro,
                enderecoCidade: data.enderecoCidade,
                enderecoUF: data.enderecoUF,
                enderecoCEP: data.enderecoCEP,
             },
        });
    }

    async countUsers() {
        return prisma.torcedor.count();
    }

    async getUserWithDetails(id: string) {
        return prisma.torcedor.findUnique({
            where: { id },
            select: {
                id: true,
                matricula: true,
                nome: true,
                email: true,
                telefone: true,
                cpf: true,
                dataNascimento: true,
                genero: true,
                fotoUrl: true,
                enderecoLogradouro: true,
                enderecoNumero: true,
                enderecoBairro: true,
                enderecoCidade: true,
                enderecoUF: true,
                enderecoCEP: true,
                statusSocio: true,
                inadimplenteDesde: true,
                aceitaTermosEm: true,
                aceitaMarketing: true,
                aceitaMarketingEm: true,
                origemCadastro: true,
                documentoFrenteUrl: true,
                documentoVersoUrl: true,
                gatewayClienteId: true,
                faceId: true,
                emailVerificado: true,
                criadoEm: true,
                atualizadoEm: true,
                assinaturas: {
                    include: {
                        plano: true,
                        faturas: true,
                    },
                },
                pagamentos: true,
                ingressos: {
                    include: {
                        jogo: true,
                        lote: true,
                    },
                },
                pedidos: true,
            },
        });
    }

    async getUserByEmailToken(emailToken: string) {
        return prisma.torcedor.findUnique({
            where: { emailToken },
        });
    }

    async verifyEmail(id: string) {
        return prisma.torcedor.update({
            where: { id },
            data: {
                emailVerificado: true,
                emailToken: null,
                emailTokenExpiraEm: null,
            },
        });
    }

    async updateEmailToken(id: string, emailToken: string, emailTokenExpiraEm: Date) {
        return prisma.torcedor.update({
            where: { id },
            data: { emailToken, emailTokenExpiraEm },
        });
    }

    async updatePhotoUrl(id: string, fotoUrl: string) {
        return prisma.torcedor.update({
            where: { id },
            data: { fotoUrl },
        });
    }

    async markEmailAsVerified(id: string) {
        return prisma.torcedor.update({
            where: { id },
            data: {
                emailVerificado: true,
                emailToken: null,
                emailTokenExpiraEm: null,
            },
        });
    }

}

