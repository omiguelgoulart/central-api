import { PrismaClient, StatusIngresso } from "@prisma/client"
import { z } from 'zod'
import { Router } from "express";


const router = Router();

const prisma = new PrismaClient()

const checkinSchema = z.object({
  ingressoId: z.string().uuid().optional(),
  qrCode: z.string().min(1).optional(),
  local: z.string().min(1).optional(),
  feitoPor: z.string().min(1).optional(), // pode ser id do admin, email, nome...
});

type CheckinBody = z.infer<typeof checkinSchema>;

type CheckinApiStatus = "VALIDO" | "USADO" | "INVALIDO";

type CheckinApiResponse = {
  status: CheckinApiStatus;
  mensagem: string;
  ingressoId?: string;
  jogo?: {
    id: string;
    nome: string;
    data: Date;
  };
};

router.post("/", async (req, res) => {
    const parsed = checkinSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: "INVALIDO",
        mensagem: "Dados inválidos para check-in.",
      });
    }

    const { ingressoId, qrCode, local, feitoPor } = parsed.data as CheckinBody;

    if (!ingressoId && !qrCode) {
      return res.status(400).json({
        status: "INVALIDO",
        mensagem: "É necessário informar ingressoId ou qrCode.",
      });
    }

    try {
      const ingresso = await prisma.ingresso.findUnique({
        where: ingressoId
          ? { id: ingressoId }
          : { qrCode: qrCode as string },
        include: {
          jogo: true,
        },
      });

      if (!ingresso) {
        return res.status(200).json({
          status: "INVALIDO",
          mensagem: "Ingresso não encontrado.",
        });
      }

      const jogoInfo =
        ingresso.jogo != null
          ? {
              id: ingresso.jogo.id,
              nome: ingresso.jogo.nome,
              data: ingresso.jogo.data,
            }
          : undefined;

      if (ingresso.status === StatusIngresso.USADO) {
        return res.status(200).json({
          status: "USADO",
          mensagem: "Este ingresso já foi utilizado.",
          ingressoId: ingresso.id,
          jogo: jogoInfo,
        });
      }

      if (
        ingresso.status === StatusIngresso.CANCELADO ||
        ingresso.status === StatusIngresso.EXPIRADO ||
        ingresso.status === StatusIngresso.ESTORNADO ||
        ingresso.status === StatusIngresso.PENDENTE
      ) {
        const motivo =
          ingresso.status === StatusIngresso.PENDENTE
            ? "Pagamento ainda não confirmado para este ingresso."
            : "Ingresso não é válido para entrada.";

        return res.status(200).json({
          status: "INVALIDO",
          mensagem: motivo,
          ingressoId: ingresso.id,
          jogo: jogoInfo,
        });
      }

      const agora = new Date();

      const [ingressoAtualizado] = await prisma.$transaction([
        prisma.ingresso.update({
          where: { id: ingresso.id },
          data: {
            status: StatusIngresso.USADO,
            usadoEm: agora,
          },
        }),
        prisma.checkin.create({
          data: {
            ingressoId: ingresso.id,
            feitoEm: agora,
            feitoPor,
            local,
          },
        }),
      ]);

      return res.status(200).json({
        status: "VALIDO",
        mensagem: "Check-in realizado com sucesso.",
        ingressoId: ingressoAtualizado.id,
        jogo: jogoInfo,
      });
    } catch (error) {
      console.error("[CHECKIN_INGRESSO] Erro ao realizar check-in:", error);

      return res.status(500).json({
        status: "INVALIDO",
        mensagem: "Erro interno ao processar o check-in.",
      });
    }
  }
);

export { router as checkinRouter };
