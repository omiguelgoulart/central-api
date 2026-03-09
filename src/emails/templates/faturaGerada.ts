export const emailFaturaGerada = (dados: {
    nome: string;
    plano: string;
    competencia: string;
    valor: number;
    vencimentoEm: string;
    linkPagamento?: string;
}) => {
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background-color: #c41e3a; color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Nova Fatura Disponível 📋</h1>
                </div>

                <div style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Olá <strong>${dados.nome}</strong>,
                    </p>

                    <p style="color: #666; line-height: 1.6;">
                        Uma nova fatura referente à sua assinatura foi gerada.
                    </p>

                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                        <h3 style="margin: 0 0 10px; color: #333;">Detalhes da Fatura:</h3>
                        <p style="margin: 4px 0; color: #555;"><strong>Plano:</strong> ${dados.plano}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Competência:</strong> ${dados.competencia}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Valor:</strong> R$ ${dados.valor.toFixed(2)}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Vencimento:</strong> ${dados.vencimentoEm}</p>
                    </div>

                    ${dados.linkPagamento ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dados.linkPagamento}" style="background-color: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                            Pagar Fatura
                        </a>
                    </div>
                    ` : ''}
                </div>

                <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
