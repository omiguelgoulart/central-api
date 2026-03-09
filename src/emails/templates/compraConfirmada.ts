export const emailCompraConfirmada = (dados: {
    nomeTorcedor: string;
    email: string;
    numeroIngresso: string;
    evento: string;
    data: string;
    local: string;
    valor: number;
    pedidoId: string;
}) => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #c41e3a; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; border: 1px solid #1a1a1a; }
                    .footer { background-color: #1a1a1a; color: white; padding: 10px; text-align: center; font-size: 12px; }
                    .info-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #c41e3a; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Compra Confirmada! 🎫</h1>
                    </div>
                    
                    <div class="content">
                        <p>Olá <strong>${dados.nomeTorcedor}</strong>,</p>
                        
                        <p>Sua compra de ingresso foi confirmada com sucesso!</p>
                        
                        <div class="info-box">
                            <h3>Detalhes do Pedido:</h3>
                            <p><strong>Número do Pedido:</strong> ${dados.pedidoId}</p>
                            <p><strong>Número do Ingresso:</strong> ${dados.numeroIngresso}</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>Informações do Evento:</h3>
                            <p><strong>Evento:</strong> ${dados.evento}</p>
                            <p><strong>Data:</strong> ${dados.data}</p>
                            <p><strong>Local:</strong> ${dados.local}</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>Valor:</h3>
                            <p><strong>R$ ${dados.valor.toFixed(2)}</strong></p>
                        </div>
                        
                        <p>Guarde esse e-mail com segurança. Você precisará apresentar o número do ingresso na entrada do evento.</p>
                        
                        <p>Obrigado por sua compra!</p>
                    </div>
                    
                    <div class="footer">
                        <p>Este é um e-mail automático. Não responda este e-mail.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};