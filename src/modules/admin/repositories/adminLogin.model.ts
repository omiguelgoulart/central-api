import { prisma } from "../../../lib/prisma";

export class AdminLoginModel {
  async getAdminByEmail(email: string) {
    return prisma.admin.findFirst({
      where: {
        email,
        ativo: true,
      },
    });
  }
}
