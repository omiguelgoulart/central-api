import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_KEY ?? "dev-secret";

router.post("/", async (req, res) => {
  const { email, senha } = req.body as { email?: string; senha?: string };
  const mensagemPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    return res.status(400).json({ erro: mensagemPadrao });
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        email,
        ativo: true, 
      },
    });

    if (!admin) {
      return res.status(400).json({ erro: mensagemPadrao });
    }

    const senhaConfere = await bcrypt.compare(senha, admin.senha);
    if (!senhaConfere) {
      return res.status(400).json({ erro: mensagemPadrao });
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        adminNome: admin.nome,
        adminEmail: admin.email,
        adminRole: admin.role, 
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(200).json({
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Erro no login admin:", error);
    return res.status(500).json({
      error: "Erro interno no servidor ao fazer login de admin",
    });
  }
});

export default router;
