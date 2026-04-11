import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

import { prisma } from "../../../lib/prisma";

export class AuthRepository {
  constructor(private readonly prismaClient = prisma) { }

  async forgotPassword(email: string) {
    return this.recoverPassword(email);
  }

  async findUserByEmail(email: string) {
    const emailNormalizado = email.trim();

    return this.prismaClient.torcedor.findFirst({
      where: {
        email: {
          equals: emailNormalizado,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
      },
    });
  }

  async login(email: string, senha: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const senhaValida = await compare(senha, user.senha);
    if (!senhaValida) return null;

    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY não configurado");
    }

    const token = sign(
      {
        userLogadoId: user.id,
        userLogadoNome: user.nome,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      token,
    };
  }

  async recoverPassword(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const senhaToken = crypto.randomUUID();
    const senhaTokenExpiraEm = new Date(Date.now() + 60 * 60 * 1000);

    return this.prismaClient.torcedor.update({
      where: { id: user.id },
      data: { senhaToken, senhaTokenExpiraEm },
    });
  }

  async resetPassword(token: string, senhaHash: string) {
    return this.prismaClient.torcedor.update({
      where: { senhaToken: token },
      data: {
        senha: senhaHash,
        senhaToken: null,
        senhaTokenExpiraEm: null,
      },
    });
  }

  async updatePasswordById(userId: string, senhaHash: string) {
    return this.prismaClient.torcedor.update({
      where: { id: userId },
      data: {
        senha: senhaHash,
      },
    });
  }
}
