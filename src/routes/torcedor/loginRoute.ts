import { Router } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const router = Router()
const prisma = new PrismaClient()

router.post("/", async (req, res) => {
  const { email, senha } = req.body
    const mensaPadrao = "Login ou senha incorretos"
    if (!email || !senha) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }
    try {
      const torcedor = await prisma.torcedor.findFirst({
        where: { email },
      })
        if (!torcedor) {
            res.status(400).json({ erro: mensaPadrao })
            return
        }
        const senhaConfere = await bcrypt.compare(senha, torcedor.senha)
        if (!senhaConfere) {
            // opcional: logar tentativa inválida
            res.status(400).json({ erro: mensaPadrao })
            return
        }
        const token = jwt.sign(
            {
                userLogadoId: torcedor.id,
                userLogadoNome: torcedor.nome,
            },
            process.env.JWT_KEY as string,
            { expiresIn: "1h" }
        )
        res.status(200).json({
            id: torcedor.id,
            nome: torcedor.nome,
            email: torcedor.email,
            token,
        })
    } catch (error) {
        res.status(500).json({ erro: "Erro interno no servidor", detalhe: error })
    }
})
export default router
