import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AdminLoginModel } from "../repositories/adminLogin.model";

export class AdminLoginService {
  constructor(private readonly model = new AdminLoginModel()) {}

  async login(email: string, senha: string) {
    const mensagemPadrao = "Login ou senha incorretos";

    const admin = await this.model.getAdminByEmail(email);
    if (!admin) {
      throw new Error(mensagemPadrao);
    }

    const senhaConfere = await bcrypt.compare(senha, admin.senha);
    if (!senhaConfere) {
      throw new Error(mensagemPadrao);
    }

    const jwtSecret = process.env.JWT_KEY ?? "dev-secret";
    const token = jwt.sign(
      {
        adminId: admin.id,
        adminNome: admin.nome,
        adminEmail: admin.email,
        adminRole: admin.role,
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    return {
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
