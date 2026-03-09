export const emailPagamentoAtrasado = (dados: {
    nome: string;
    valor: number;
    descricao: string;
    dataVencimento: string;
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
                    <h1 style="margin: 0; font-size: 24px;">Pagamento em Atraso ⚠️</h1>
                </div>

                <div style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Olá <strong>${dados.nome}</strong>,
                    </p>

                    <p style="color: #666; line-height: 1.6;">
                        Identificamos que o pagamento abaixo encontra-se em atraso. Regularize sua situação para evitar a suspensão dos seus benefícios.
                    </p>

                    <div style="background-color: #ffe6e6; border-left: 4px solid #cc0000; padding: 15px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px; color: #7a0000;">Pagamento pendente:</h3>
                        <p style="margin: 4px 0; color: #555;"><strong>Descrição:</strong> ${dados.descricao}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Valor:</strong> R$ ${dados.valor.toFixed(2)}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Vencimento:</strong> ${dados.dataVencimento}</p>
                    </div>

                    ${dados.linkPagamento ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dados.linkPagamento}" style="background-color: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                            Pagar Agora
                        </a>
                    </div>
                    ` : ''}

                    <p style="color: #999; font-size: 13px; line-height: 1.5;">
                        Se você já efetuou o pagamento, por favor desconsidere este e-mail. A confirmação pode levar até 3 dias úteis.
                    </p>
                </div>

                <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
