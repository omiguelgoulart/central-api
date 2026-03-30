export interface RedefinicaoSenhaProps {
    nome: string;
    token: string;
    linkBase: string;
}

export const redefinicaoSenhaTemplate = ({
    nome,
    token,
    linkBase,
}: RedefinicaoSenhaProps): string => {
    const link = `${linkBase}?token=${encodeURIComponent(token)}`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #c41e3a; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Redefinição de Senha 🔐</h1>
        </div>

        <div style="padding: 30px 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Olá <strong>${nome}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6; margin: 15px 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #c41e3a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Redefinir Senha
                </a>
            </div>

            <p style="color: #999; font-size: 13px; line-height: 1.5; margin-top: 20px;">
                Este link é válido por 1 hora. Se você não solicitou a redefinição de senha, ignore este e-mail — sua conta permanece segura.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

            <p style="color: #bbb; font-size: 12px; line-height: 1.4;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                <span style="color: #c41e3a; word-break: break-all;">${link}</span>
            </p>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
        </div>
    </div>
</body>
</html>`;
};
