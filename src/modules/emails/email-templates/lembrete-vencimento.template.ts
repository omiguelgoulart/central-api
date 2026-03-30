export interface LembreteVencimentoProps {
    nomeTorcedor: string;
    dataVencimento: string;
    diasRestantes: number;
    link?: string;
}

export const lembreteVencimentoTemplate = ({
    nomeTorcedor,
    dataVencimento,
    diasRestantes,
    link,
}: LembreteVencimentoProps): string => {
    const botaoRenovar = link
        ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #cc0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Renovar Agora
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
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="padding: 20px 0;">
            <h2 style="color: #1a0000; font-size: 18px; font-weight: bold;">Olá ${nomeTorcedor},</h2>

            <p style="color: #666; line-height: 1.6; margin: 15px 0;">
                Este é um lembrete de que sua assinatura/serviço vencerá em <strong>${diasRestantes} dias</strong>.
            </p>

            <div style="background-color: #ffe6e6; border-left: 4px solid #cc0000; padding: 12px; margin: 20px 0;">
                <p style="margin: 0; color: #7a0000;">
                    <strong>Data de vencimento:</strong> ${dataVencimento}
                </p>
            </div>

            <p style="color: #666; line-height: 1.6; margin: 15px 0;">
                Para renovar ou atualizar suas informações, clique no botão abaixo:
            </p>

            ${botaoRenovar}

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
                Dúvidas? Entre em contato conosco respondendo este email.
            </p>
        </div>
    </div>
</body>
</html>`;
};
