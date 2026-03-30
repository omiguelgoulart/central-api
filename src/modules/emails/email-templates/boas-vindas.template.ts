export interface BoasVindasProps {
    nome: string;
    matricula: string;
}

export const boasVindasTemplate = ({ nome, matricula }: BoasVindasProps): string => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #c41e3a; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Bem-vindo(a) à Central de Torcedores! ⚽</h1>
        </div>

        <div style="padding: 30px 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Olá <strong>${nome}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6;">
                Seu cadastro foi realizado com sucesso! Agora você faz parte da nossa comunidade de torcedores.
            </p>

            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                <p style="margin: 0; color: #333;">
                    <strong>Sua matrícula:</strong> ${matricula}
                </p>
            </div>

            <p style="color: #666; line-height: 1.6;">Com sua conta você pode:</p>

            <ul style="color: #666; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Comprar ingressos para os jogos</li>
                <li style="margin-bottom: 8px;">Assinar um plano de sócio-torcedor</li>
                <li style="margin-bottom: 8px;">Acompanhar seus pagamentos e faturas</li>
            </ul>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
        </div>
    </div>
</body>
</html>`;
};
