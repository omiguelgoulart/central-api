import { StatusAssinatura, StatusFatura, StatusSocio } from "@prisma/client";

import { prisma } from "../../../lib/prisma";

export class LgpdService {
  constructor(private readonly prismaClient = prisma) {}

  async anonimizarTorcedor(torcedorId: string, origem: "TITULAR" | "ADMIN") {
    const torcedor = await this.prismaClient.torcedor.findUnique({
      where: { id: torcedorId },
      select: { id: true, anonimizadoEm: true },
    });

    if (!torcedor) {
      throw new Error("Torcedor não encontrado");
    }

    if (torcedor.anonimizadoEm) {
      throw new Error("Torcedor já anonimizado");
    }

    const agora = new Date();

    await this.prismaClient.$transaction(async (tx) => {
      const assinaturas = await tx.assinatura.findMany({
        where: {
          torcedorId,
          status: { not: StatusAssinatura.CANCELADA },
        },
        select: { id: true },
      });

      const assinaturaIds = assinaturas.map((a) => a.id);

      if (assinaturaIds.length > 0) {
        await tx.fatura.updateMany({
          where: {
            assinaturaId: { in: assinaturaIds },
            status: { in: [StatusFatura.ABERTA, StatusFatura.ATRASADA] },
          },
          data: { status: StatusFatura.CANCELADA },
        });

        await tx.assinatura.updateMany({
          where: { id: { in: assinaturaIds } },
          data: {
            status: StatusAssinatura.CANCELADA,
            canceladaEm: agora,
            motivoCancelamento: "Anonimização LGPD",
          },
        });
      }

      await tx.torcedor.update({
        where: { id: torcedorId },
        data: {
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
          anonimizadoEm: agora,
          exclusaoSolicitadaEm: origem === "TITULAR" ? agora : undefined,
          emailToken: null,
          emailTokenExpiraEm: null,
          senhaToken: null,
          senhaTokenExpiraEm: null,
        },
      });
    });

    return { message: "Dados pessoais removidos com sucesso" };
  }
}
