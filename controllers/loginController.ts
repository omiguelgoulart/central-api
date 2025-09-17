import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { Request, Response } from "express"

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
})

export async function loginController(req: Request, res: Response): Promise<void> {
  const { email, senha } = req.body

  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email },
    })

    if (!usuario) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha)

    if (!senhaConfere) {
      // opcional: logar tentativa inválida
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const token = jwt.sign(
      {
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome,
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    )

    res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      token,
    })
  } catch (error) {
    res.status(500).json({ erro: "Erro interno no servidor", detalhe: error })
  }
}
