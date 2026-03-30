export interface ItemPedido {
    setor: string;
    tipo: string;
    preco: number;
}

export interface PedidoConfirmadoProps {
    nome: string;
    pedidoId: string;
    total: number;
    itens: ItemPedido[];
    evento?: string;
    data?: string;
    local?: string;
}

export const pedidoConfirmadoTemplate = (pedido: PedidoConfirmadoProps): string => {
    const linhasTabela = pedido.itens
        .map(
            (item) => `
                <div style="display: flex; border-bottom: 1px solid #eee;">
                    <div style="flex: 1; padding: 8px; color: #555; text-align: left;">${item.setor}</div>
                    <div style="flex: 1; padding: 8px; color: #555; text-align: left;">${item.tipo}</div>
                    <div style="flex: 1; padding: 8px; color: #555; text-align: right;">R$ ${item.preco.toFixed(2)}</div>
                </div>
            `
        )
        .join('');

    return `<!DOCTYPE html>
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
                Olá <strong>${pedido.nome}</strong>,
            </p>

            <p style="color: #666; line-height: 1.6; margin: 15px 0;">
                Seu pedido foi confirmado com sucesso!
            </p>

            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                <p style="margin: 4px 0; color: #333;">
                    <strong>Pedido:</strong> ${pedido.pedidoId}
                </p>
                ${pedido.evento ? `<p style="margin: 4px 0; color: #333;">
                    <strong>Evento:</strong> ${pedido.evento}
                </p>` : ''}
                ${pedido.data ? `<p style="margin: 4px 0; color: #333;">
                    <strong>Data:</strong> ${pedido.data}
                </p>` : ''}
                ${pedido.local ? `<p style="margin: 4px 0; color: #333;">
                    <strong>Local:</strong> ${pedido.local}
                </p>` : ''}
            </div>

            <div style="margin: 20px 0;">
                <div style="display: flex; background-color: #1a1a1a; color: white;">
                    <div style="flex: 1; padding: 10px 8px; text-align: left; font-size: 14px; font-weight: bold;">Setor</div>
                    <div style="flex: 1; padding: 10px 8px; text-align: left; font-size: 14px; font-weight: bold;">Tipo</div>
                    <div style="flex: 1; padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold;">Valor</div>
                </div>
                ${linhasTabela}
                <div style="display: flex; border-top: 2px solid #333;">
                    <div style="flex: 2; padding: 10px 8px; text-align: right; font-weight: bold; color: #333;">Total</div>
                    <div style="flex: 1; padding: 10px 8px; text-align: right; font-weight: bold; color: #c41e3a;">R$ ${pedido.total.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 15px 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Este é um e-mail automático. Não responda este e-mail.</p>
        </div>
    </div>
</body>
</html>`;
};
