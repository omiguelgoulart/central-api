import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../emails/service/email.service";
import { emailRedefinicaoSenha } from "../../emails/templates/redefinicaoSenha";
import { validaSenha } from "../../utils/validaSenha";

const router = Router();

router.post("/recuperar-senha", async (req, res) => {
    try {
        const { email } = z.object({
            email: z.string().email("E-mail inválido"),
        }).parse(req.body);

        const torcedor = await prisma.torcedor.findUnique({
            where: { email },
            select: { id: true, nome: true, email: true },
        });

        if (!torcedor) {
            return res.status(200).json({
                message: "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.",
            });
        }

        const senhaToken = crypto.randomUUID();
        const senhaTokenExpiraEm = new Date(Date.now() + 60 * 60 * 1000); 

        await prisma.torcedor.update({
            where: { id: torcedor.id },
            data: { senhaToken, senhaTokenExpiraEm },
        });

        const linkBase =
            (process.env.FRONTEND_URL ?? process.env.BASE_URL ?? "http://localhost:3000") +
            "/novaSenha";

        sendEmail({
            to: torcedor.email,
            subject: "Redefinição de senha - Central de Torcedores",
            html: emailRedefinicaoSenha({
                nome: torcedor.nome,
                token: senhaToken,
                linkBase,
            }),
        }).catch((err) => console.error("Erro ao enviar e-mail de recuperação:", err));

        return res.status(200).json({
            message: "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Erro em /recuperar-senha:", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

router.post("/redefinir-senha", async (req, res) => {
    try {
        const { token, novaSenha } = z.object({
            token: z.string().uuid("Token inválido"),
            novaSenha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        }).parse(req.body);

        const erros = validaSenha(novaSenha);
        if (Array.isArray(erros) && erros.length > 0) {
            return res.status(400).json({ error: "Senha inválida", detalhes: erros });
        }

        const torcedor = await prisma.torcedor.findUnique({
            where: { senhaToken: token },
            select: { id: true, senhaTokenExpiraEm: true },
        });

        if (!torcedor || !torcedor.senhaTokenExpiraEm || torcedor.senhaTokenExpiraEm < new Date()) {
            return res.status(400).json({ error: "Token inválido ou expirado." });
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await prisma.torcedor.update({
            where: { id: torcedor.id },
            data: {
                senha: senhaHash,
                senhaToken: null,
                senhaTokenExpiraEm: null,
            },
        });

        return res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Erro em /redefinir-senha:", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

export default router;
