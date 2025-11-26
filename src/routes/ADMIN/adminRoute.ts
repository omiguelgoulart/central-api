import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Router } from "express";
import { validaSenha } from "../../utils/validaSenha";

const router = Router();

const prisma = new PrismaClient();

const adminSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  role: z.enum(["SUPER_ADMIN", "OPERACIONAL", "PORTARIA"]).optional(),
});

function validarSenhaOu400(senha: string, res: any): boolean {
  const erros = validaSenha(senha);
    if (Array.isArray(erros) && erros.length > 0) {
        res.status(400).json({
            error: "Senha inválida",
            detalhes: erros,
        });
        return false;
    }
    return true;
}

router.post("/", async (req, res) => {
    try {
        const { nome, email, senha, role } = adminSchema.parse(req.body);

        if (!validarSenhaOu400(senha, res)) return;
        const adminExistente = await prisma.admin.findUnique({
            where: { email },
        });
        if (adminExistente) {
            res.status(400).json({ error: "E-mail já cadastrado" });
            return;
        }
        const senhaHashed = await bcrypt.hash(senha, 10);
        const novoAdmin = await prisma.admin.create({
            data: {
                nome,
                email,
                senha: senhaHashed,
                role: role ?? "OPERACIONAL",
            },
        });
        res.status(201).json({ message: "Admin criado com sucesso", adminId: novoAdmin.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao criar admin" });
    }
});

router.get("/", async (req, res) => {
    try {
        const admins = await prisma.admin.findMany({
            select: { id: true, nome: true, email: true, role: true, criadoEm: true },
        });
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar admins" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await prisma.admin.findUnique({
            where: { id },
            select: { id: true, nome: true, email: true, role: true, criadoEm: true },
        });
        if (!admin) {
            res.status(404).json({ error: "Admin não encontrado" });
            return;
        }
        res.json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar admin" });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await prisma.admin.findUnique({
            where: { id },
        });
        if (!admin) {
            res.status(404).json({ error: "Admin não encontrado" });
            return;
        }
        await prisma.admin.delete({
            where: { id },
        });
        res.json({ message: "Admin deletado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar admin" });
    }
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const adminExistente = await prisma.admin.findUnique({
            where: { id },
        });
        if (!adminExistente) {
            res.status(404).json({ error: "Admin não encontrado" });
            return;
        }
        const { nome, email, senha, role } = adminSchema.partial().parse(req.body);

        const dadosAtualizados: any = {};
        if (nome !== undefined) dadosAtualizados.nome = nome;
        if (email !== undefined) dadosAtualizados.email = email;
        if (role !== undefined) dadosAtualizados.role = role;
        if (senha !== undefined) {
            if (!validarSenhaOu400(senha, res)) return;
            const senhaHashed = await bcrypt.hash(senha, 10);
            dadosAtualizados.senha = senhaHashed;
        }
        await prisma.admin.update({
            where: { id },
            data: dadosAtualizados,
        });
        res.json({ message: "Admin atualizado com sucesso" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar admin" });
    }
});

export default router;