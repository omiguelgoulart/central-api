export const emailAssinaturaCriada = (dados: {
    nome: string;
    plano: string;
    valor: number;
    periodicidade: string;
    inicioEm: string;
    proximaCobranca?: string;
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
                    <h1 style="margin: 0; font-size: 24px;">Assinatura Ativada! 🎉</h1>
                </div>

                <div style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Olá <strong>${dados.nome}</strong>,
                    </p>

                    <p style="color: #666; line-height: 1.6;">
                        Sua assinatura de sócio-torcedor foi ativada com sucesso! Agora você tem acesso a todos os benefícios do seu plano.
                    </p>

                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                        <h3 style="margin: 0 0 10px; color: #333;">Detalhes da Assinatura:</h3>
                        <p style="margin: 4px 0; color: #555;"><strong>Plano:</strong> ${dados.plano}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Valor:</strong> R$ ${dados.valor.toFixed(2)} / ${dados.periodicidade.toLowerCase()}</p>
                        <p style="margin: 4px 0; color: #555;"><strong>Início:</strong> ${dados.inicioEm}</p>
                        ${dados.proximaCobranca ? `<p style="margin: 4px 0; color: #555;"><strong>Próxima cobrança:</strong> ${dados.proximaCobranca}</p>` : ''}
                    </div>

                    <p style="color: #666; line-height: 1.6;">
                        Aproveite todos os benefícios exclusivos do seu plano!
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
