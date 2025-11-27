import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Router } from "express";
import { validaSenha } from "../../utils/validaSenha";
import { gerarMatricula } from "../../utils/matricula";
import { cp } from "fs";

const router = Router();
const prisma = new PrismaClient();

const usuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  enderecoLogradouro: z.string().optional(),
  enderecoNumero: z.string().optional(),
  enderecoBairro: z.string().optional(),
  enderecoCidade: z.string().optional(),
  enderecoUF: z.string().optional(),
  enderecoCEP: z.string().optional(),
});

function validarSenhaOu400(senha: string, res: any): boolean {
  const erros = validaSenha(senha); // assumindo que retorna array de erros
  if (Array.isArray(erros) && erros.length > 0) {
    res.status(400).json({
      error: "Senha inválida",
      detalhes: erros,
    });
    return false;
  }
  return true;
}

function tratarErroPrisma(e: unknown, res: any) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002" && e.meta?.target && Array.isArray(e.meta.target)) {
      if (e.meta.target.includes("email")) {
        res.status(400).json({ error: "E-mail já cadastrado" });
        return;
      }
      if (e.meta.target.includes("matricula")) {
        res.status(400).json({ error: "Matrícula já cadastrada" });
        return;
      }
    }
  }
  console.error(e);
  res.status(500).json({ error: "Erro interno do servidor" });
}

router.post("/", async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      enderecoLogradouro,
      enderecoNumero,
      enderecoBairro,
      enderecoCidade,
      enderecoUF,
      enderecoCEP,
    } = usuarioSchema.parse(req.body);

    if (!validarSenhaOu400(senha, res)) return;

    const usuarioExistente = await prisma.torcedor.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      res.status(400).json({ error: "E-mail já cadastrado" });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const matricula = await gerarMatricula();

    const novoUsuario = await prisma.torcedor.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        matricula,
        cpf: cpf ?? null,
        telefone: telefone ?? null,
        enderecoLogradouro: enderecoLogradouro ?? null,
        enderecoNumero: enderecoNumero ?? null,
        enderecoBairro: enderecoBairro ?? null,
        enderecoCidade: enderecoCidade ?? null,
        enderecoUF: enderecoUF ?? null,
        enderecoCEP: enderecoCEP ?? null,
      },
    });

    res
      .status(201)
      .json({ message: "Usuário criado com sucesso", usuarioId: novoUsuario.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    tratarErroPrisma(error, res);
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.torcedor.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
      },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

router.get("/cpf/:cpf", async (req, res) => {
  const { cpf } = req.params;

  const cpfLimpo = cpf.replace(/\D/g, "");

  try {
    const usuario = await prisma.torcedor.findUnique({
      where: { cpf: cpfLimpo },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Torcedor não encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar torcedor" });
  }
});

router.get("/matricula/:matricula", async (req, res) => {
  const { matricula } = req.params;
  try {
    const usuario = await prisma.torcedor.findUnique({
      where: { matricula },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
      },
    });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.delete("/matricula/:matricula", async (req, res) => {
  const { matricula } = req.params;
  try {
    const usuario = await prisma.torcedor.findUnique({
      where: { matricula },
    });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    await prisma.torcedor.delete({
      where: { matricula },
    });

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

router.patch("/matricula/:matricula", async (req, res) => {
  const { matricula } = req.params;
  try {
    const usuarioExistente = await prisma.torcedor.findUnique({
      where: { matricula },
    });

    if (!usuarioExistente) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      enderecoLogradouro,
      enderecoNumero,
      enderecoBairro,
      enderecoCidade,
      enderecoUF,
      enderecoCEP,
    } = usuarioSchema.partial().parse(req.body);

    if (senha && !validarSenhaOu400(senha, res)) return;

    const senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;

    await prisma.torcedor.update({
      where: { matricula },
      data: {
        nome: nome ?? usuarioExistente.nome,
        email: email ?? usuarioExistente.email,
        senha: senhaHash ?? usuarioExistente.senha,
        cpf: cpf ?? usuarioExistente.cpf,
        telefone: telefone ?? usuarioExistente.telefone,
        enderecoLogradouro: enderecoLogradouro ?? usuarioExistente.enderecoLogradouro,
        enderecoNumero: enderecoNumero ?? usuarioExistente.enderecoNumero,
        enderecoBairro: enderecoBairro ?? usuarioExistente.enderecoBairro,
        enderecoCidade: enderecoCidade ?? usuarioExistente.enderecoCidade,
        enderecoUF: enderecoUF ?? usuarioExistente.enderecoUF,
        enderecoCEP: enderecoCEP ?? usuarioExistente.enderecoCEP,
      },
    });

    res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    tratarErroPrisma(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioExistente = await prisma.torcedor.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      enderecoLogradouro,
      enderecoNumero,
      enderecoBairro,
      enderecoCidade,
      enderecoUF,
      enderecoCEP,
    } = usuarioSchema.partial().parse(req.body);

    if (senha && !validarSenhaOu400(senha, res)) return;

    const senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;

    await prisma.torcedor.update({
      where: { id },
      data: {
        nome: nome ?? usuarioExistente.nome,
        email: email ?? usuarioExistente.email,
        senha: senhaHash ?? usuarioExistente.senha,
        cpf: cpf ?? usuarioExistente.cpf,
        telefone: telefone ?? usuarioExistente.telefone,
        enderecoLogradouro: enderecoLogradouro ?? usuarioExistente.enderecoLogradouro,
        enderecoNumero: enderecoNumero ?? usuarioExistente.enderecoNumero,
        enderecoBairro: enderecoBairro ?? usuarioExistente.enderecoBairro,
        enderecoCidade: enderecoCidade ?? usuarioExistente.enderecoCidade,
        enderecoUF: enderecoUF ?? usuarioExistente.enderecoUF,
        enderecoCEP: enderecoCEP ?? usuarioExistente.enderecoCEP,
      },
    });

    res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    tratarErroPrisma(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.torcedor.findUnique({
      where: { id },
    });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    await prisma.torcedor.delete({
      where: { id },
    });

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.torcedor.findUnique({
      where: { id },
      select: {
        id: true,
        matricula: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        dataNascimento: true,
        genero: true,
        fotoUrl: true,
        enderecoLogradouro: true,
        enderecoNumero: true,
        enderecoBairro: true,
        enderecoCidade: true,
        enderecoUF: true,
        enderecoCEP: true,
        statusSocio: true,
        inadimplenteDesde: true,
        aceitaTermosEm: true,
        aceitaMarketing: true,
        aceitaMarketingEm: true,
        origemCadastro: true,
        documentoFrenteUrl: true,
        documentoVersoUrl: true,
        gatewayClienteId: true,
        faceId: true,
        criadoEm: true,
        atualizadoEm: true,
        assinaturas: {
          include: {
            plano: true,
            faturas: true,
          },
        },
        pagamentos: true,
        ingressos: {
          include: {
            jogo: true,
            lote: true,
          },
        },
        pedidos: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

export default router;
