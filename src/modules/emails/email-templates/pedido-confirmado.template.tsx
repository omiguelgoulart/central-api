import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import React from "react";

interface ItemPedido {
  setor: string;
  tipo: string;
  preco: number;
}

interface PedidoConfirmadoProps {
  nome: string;
  pedidoId: string;
  total: number;
  itens: ItemPedido[];
  evento?: string;
  data?: string;
  local?: string;
}

export function PedidoConfirmado(pedido: PedidoConfirmadoProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Pedido Confirmado! 🎫</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Pedido Confirmado! 🎫</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{pedido.nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Seu pedido foi confirmado com sucesso!
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Pedido:</strong> {pedido.pedidoId}
              </Text>
              {pedido.evento && (
                <Text style={infoText}>
                  <strong>Evento:</strong> {pedido.evento}
                </Text>
              )}
              {pedido.data && (
                <Text style={infoText}>
                  <strong>Data:</strong> {pedido.data}
                </Text>
              )}
              {pedido.local && (
                <Text style={infoText}>
                  <strong>Local:</strong> {pedido.local}
                </Text>
              )}
            </Section>

            <Section style={tableSection}>
              <div style={tableContainer}>
                <div style={tableHeaderRow}>
                  <div style={tableHeaderCell}>Setor</div>
                  <div style={tableHeaderCell}>Tipo</div>
                  <div style={tableHeaderCellRight}>Valor</div>
                </div>
                {pedido.itens.map((item, index) => (
                  <div key={index} style={tableBodyRow}>
                    <div style={tableCell}>{item.setor}</div>
                    <div style={tableCell}>{item.tipo}</div>
                    <div style={tableCellRight}>R$ {item.preco.toFixed(2)}</div>
                  </div>
                ))}
                <div style={tableFooterRow}>
                  <div style={tableTotalLabelContainer}>
                    <div style={tableTotalLabel}>Total</div>
                  </div>
                  <div style={tableTotalValue}>R$ {pedido.total.toFixed(2)}</div>
                </div>
              </div>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este é um e-mail automático. Não responda este e-mail.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};


const main = {
  margin: "0",
  padding: "0",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f5f5f5",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header = {
  backgroundColor: "#c41e3a",
  color: "white",
  padding: "30px 20px",
  textAlign: "center" as const,
};

const headerTitle = {
  margin: "0",
  fontSize: "24px",
  color: "white",
};

const content = {
  padding: "30px 20px",
};

const greeting = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "1.6",
};

const paragraph = {
  color: "#666",
  lineHeight: "1.6",
  margin: "15px 0",
};

const infoBox = {
  backgroundColor: "#f9f9f9",
  padding: "15px",
  margin: "20px 0",
  borderLeft: "4px solid #c41e3a",
};

const infoText = {
  margin: "4px 0",
  color: "#333",
};

const tableSection: React.CSSProperties = {
  margin: "20px 0",
};

const tableContainer: React.CSSProperties = {
  width: "100%",
  margin: "20px 0",
};

const tableHeaderRow: React.CSSProperties = {
  display: "flex",
  backgroundColor: "#1a1a1a",
  color: "white",
};

const tableHeaderCell = {
  flex: 1,
  padding: "10px 8px",
  textAlign: "left" as const,
  fontSize: "14px",
  fontWeight: "bold" as const,
};

const tableHeaderCellRight = {
  ...tableHeaderCell,
  textAlign: "right" as const,
};

const tableBodyRow: React.CSSProperties = {
  display: "flex",
  borderBottom: "1px solid #eee",
};

const tableCell = {
  flex: 1,
  padding: "8px",
  color: "#555",
  textAlign: "left" as const,
};

const tableCellRight = {
  ...tableCell,
  textAlign: "right" as const,
};

const tableFooterRow: React.CSSProperties = {
  display: "flex",
  borderTop: "2px solid #333",
};

const tableTotalLabel = {
  fontWeight: "bold" as const,
  color: "#333",
};

const tableTotalLabelContainer = {
  flex: 2,
  padding: "10px 8px",
};

const tableTotalValue = {
  flex: 1,
  padding: "10px 8px",
  fontWeight: "bold" as const,
  color: "#c41e3a",
  textAlign: "right" as const,
};

const footer = {
  backgroundColor: "#1a1a1a",
  color: "#999",
  padding: "15px 20px",
  textAlign: "center" as const,
  fontSize: "12px",
};

const footerText = {
  margin: "0",
};
