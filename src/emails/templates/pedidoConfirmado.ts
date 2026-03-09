export const emailPedidoConfirmado = (dados: {
    nome: string;
    pedidoId: string;
    total: number;
    itens: Array<{
        setor: string;
        tipo: string;
        preco: number;
    }>;
    evento?: string;
    data?: string;
    local?: string;
}) => {
    const itensHtml = dados.itens
        .map(
            (item) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #555;">${item.setor}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #555;">${item.tipo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #555; text-align: right;">R$ ${item.preco.toFixed(2)}</td>
            </tr>`
        )
        .join('');

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
                    <h1 style="margin: 0; font-size: 24px;">Pedido Confirmado! 🎫</h1>
                </div>

                <div style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Olá <strong>${dados.nome}</strong>,
                    </p>

                    <p style="color: #666; line-height: 1.6;">
                        Seu pedido foi confirmado com sucesso!
                    </p>

                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                        <p style="margin: 0 0 5px; color: #333;"><strong>Pedido:</strong> ${dados.pedidoId}</p>
                        ${dados.evento ? `<p style="margin: 4px 0; color: #555;"><strong>Evento:</strong> ${dados.evento}</p>` : ''}
                        ${dados.data ? `<p style="margin: 4px 0; color: #555;"><strong>Data:</strong> ${dados.data}</p>` : ''}
                        ${dados.local ? `<p style="margin: 4px 0; color: #555;"><strong>Local:</strong> ${dados.local}</p>` : ''}
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #1a1a1a; color: white;">
                                <th style="padding: 10px 8px; text-align: left;">Setor</th>
                                <th style="padding: 10px 8px; text-align: left;">Tipo</th>
                                <th style="padding: 10px 8px; text-align: right;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itensHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 10px 8px; font-weight: bold; color: #333;">Total</td>
                                <td style="padding: 10px 8px; font-weight: bold; color: #c41e3a; text-align: right;">R$ ${dados.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
