export const emailAssinaturaCancelada = (dados: {
    nome: string;
    plano: string;
    canceladaEm: string;
    motivo?: string;
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
                    <h1 style="margin: 0; font-size: 24px;">Assinatura Cancelada</h1>
                </div>

                <div style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Olá <strong>${dados.nome}</strong>,
                    </p>

                    <p style="color: #666; line-height: 1.6;">
                        Informamos que sua assinatura foi cancelada.
                    </p>

                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                        <p style="margin: 4px 0; color: #555;"><strong>Plano:</strong> ${dados.plano}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Cancelado em:</strong> ${dados.canceladaEm}</p>
                        ${dados.motivo ? `<p style="margin: 4px 0; color: #555;"><strong>Motivo:</strong> ${dados.motivo}</p>` : ''}
                    </div>

                    <p style="color: #666; line-height: 1.6;">
                        Sentiremos sua falta! Caso mude de ideia, você pode reativar sua assinatura a qualquer momento.
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
