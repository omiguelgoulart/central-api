import { PrismaClient, MetodoPagamento, StatusPagamento } from "@prisma/client";
import { z } from "zod";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

const pagamentoSchema = z.object({
  torcedorId: z.string().uuid("ID do torcedor inválido"),
  valor: z.coerce.number({ required_error: "Informe o valor do pagamento" }),
  status: z.nativeEnum(StatusPagamento, { required_error: "Informe o status do pagamento" }),
  dataVencimento: z.coerce.date({ required_error: "Informe a data de vencimento" }),
  pagoEm: z.coerce.date().optional(),
  referencia: z.string().trim().max(120).optional(),
  metodo: z.nativeEnum(MetodoPagamento, { required_error: "Informe o método de pagamento" }),
  descricao: z.string().trim().max(500).optional(),
  faturaId: z.string().uuid().optional(),
});

router.post("/", async (req, res) => {
  try {
    const { torcedorId, valor, status, dataVencimento, pagoEm, referencia, metodo, descricao, faturaId } =
      pagamentoSchema.parse(req.body);

    const torcedorExistente = await prisma.torcedor.findUnique({ where: { id: torcedorId } });
    if (!torcedorExistente) {
      res.status(400).json({ error: "Torcedor não encontrado" });
      return;
    }

    const novoPagamento = await prisma.pagamento.create({
      data: {
        torcedorId,
        valor,
        status,
        dataVencimento,
        pagoEm,
        referencia,
        metodo,
        descricao,
        faturaId,
      },
    });

    res.status(201).json({ message: "Pagamento criado com sucesso", pagamentoId: novoPagamento.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

router.get("/", async (req, res) => {
    try {
        const pagamentos = await prisma.pagamento.findMany();
        res.status(200).json(pagamentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pagamento = await prisma.pagamento.findUnique({
            where: { id }
        });
        if (!pagamento) {
            res.status(404).json({ error: 'Pagamento não encontrado' });
            return;
        }
        res.status(200).json(pagamento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar pagamento' });
    }
});

export default router;