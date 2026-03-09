import cron from 'node-cron';
import { lembreteVencimentoTemplate } from '../templates/lembreteVencimento';

import { PrismaClient } from "@prisma/client"
import { sendEmail } from '../service/email.service';

const prisma = new PrismaClient()

export function startLembreteVencimentoJob(): void {
    cron.schedule('0 9 * * *', async () => {
        try {
            const hoje = new Date();
            const amanha = new Date(hoje);
            amanha.setDate(hoje.getDate() + 1);

            const inicio = new Date(amanha);
            inicio.setHours(0, 0, 0, 0);

            const fim = new Date(amanha);
            fim.setHours(23, 59, 59, 999);

            const pagamentos = await prisma.pagamento.findMany({
                where: {
                    dataVencimento: {
                        gte: inicio,
                        lte: fim,
                    },
                    status: 'PENDENTE',
                },
                select: {
                    id: true,
                    valor: true,
                    dataVencimento: true,
                    descricao: true,
                    torcedor: {
                        select: {
                            nome: true,
                            email: true,
                        },
                    },
                },
            });

            for (const pagamento of pagamentos) {
                const dataVencimento = pagamento.dataVencimento.getTime();

                await sendEmail({
                    to: pagamento.torcedor.email,
                    subject: 'Lembrete de vencimento',
                    html: lembreteVencimentoTemplate(
                        pagamento.torcedor.nome,
                        pagamento.descricao ?? 'Pagamento pendente',
                        dataVencimento,
                        pagamento.valor.toString(),
                    ),
                });

            }
        } catch (error) {
            console.error('Erro no job de lembrete de vencimento:', error);
        }
    });
}