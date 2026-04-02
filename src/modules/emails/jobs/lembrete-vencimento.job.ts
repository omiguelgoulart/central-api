import cron from 'node-cron';

import { prisma } from '../../../lib/prisma';
import { lembreteVencimentoTemplate } from '../email-templates/lembrete-vencimento.template';
import { sendEmail } from '../services/email.service';

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

            const pagamentos = await prisma.pagamentoSocio.findMany({
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
                const html = lembreteVencimentoTemplate({
                    nomeTorcedor: pagamento.torcedor.nome,
                    dataVencimento: pagamento.dataVencimento.toLocaleDateString('pt-BR'),
                    diasRestantes: 1,
                });

                await sendEmail({
                    to: pagamento.torcedor.email,
                    subject: 'Lembrete de vencimento',
                    html,
                });

            }
        } catch (error) {
            console.error('Erro no job de lembrete de vencimento:', error);
        }
    });
}