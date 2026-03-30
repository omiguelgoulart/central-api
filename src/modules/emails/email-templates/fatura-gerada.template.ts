export interface FaturaGeradaProps {
    nome: string;
    plano: string;
    competencia: string;
    valor: number;
    vencimentoEm: string;
    linkPagamento?: string;
}

export const faturaGeradaTemplate = ({
    nome,
    plano,
    competencia,
    valor,
    vencimentoEm,
    linkPagamento,
}: FaturaGeradaProps): string => {
    const botaoPagamento = linkPagamento
        ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${linkPagamento}" style="background-color: #c41e3a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Pagar Fatura
                </a>
            </div>
        `
        : '';

    return `<!DOCTYPE html>
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
                Olá <strong>${nome}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6; margin: 15px 0;">
                Uma nova fatura referente à sua assinatura foi gerada.
            </p>

            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Detalhes da Fatura:</p>
                <p style="margin: 4px 0; color: #555;">
                    <strong style="display: inline-block; width: 100px;">Plano:</strong> ${plano}
                </p>
                <p style="margin: 4px 0; color: #555;">
                    <strong style="display: inline-block; width: 100px;">Competência:</strong> ${competencia}
                </p>
                <p style="margin: 4px 0; color: #555;">
                    <strong style="display: inline-block; width: 100px;">Valor:</strong> R$ ${valor.toFixed(2)}
                </p>
                <p style="margin: 4px 0; color: #555;">
                    <strong style="display: inline-block; width: 100px;">Vencimento:</strong> ${vencimentoEm}
                </p>
            </div>

            ${botaoPagamento}
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
        </div>
    </div>
</body>
</html>`;
};
