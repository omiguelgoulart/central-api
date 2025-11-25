import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { email, senha } = req.body;
  const mensagemPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    res.status(400).json({ erro: mensagemPadrao });
    return;
  }

  try {
    const torcedor = await prisma.torcedor.findFirst({
      where: { email },
    });

    if (!torcedor) {
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    const senhaConfere = await bcrypt.compare(senha, torcedor.senha);
    if (!senhaConfere) {
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    const token = jwt.sign(
      {
        userLogadoId: torcedor.id,
        userLogadoNome: torcedor.nome,
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    );

    // Se o seu modelo tiver esses campos, eles serão enviados ao front:
    // - cpf
    // - cpfCnpj
    // - customerId (já salvo no banco, se houver)
    res.status(200).json({
      id: torcedor.id,
      nome: torcedor.nome,
      email: torcedor.email,
      cpf: (torcedor as any).cpf,           // ajuste o nome se for diferente
      cpfCnpj: (torcedor as any).cpfCnpj,   // opcional, se existir no modelo
      customerId: (torcedor as any).customerId, // se você já salvar isso no banco
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res
      .status(500)
      .json({ erro: "Erro interno no servidor", detalhe: String(error) });
  }
});

export default router;
