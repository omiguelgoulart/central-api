import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface CompraConfirmadaProps {
  nomeTorcedor: string;
  email: string;
  numeroIngresso: string;
  evento: string;
  data: string;
  local: string;
  valor: number;
  pedidoId: string;
}

export const CompraConfirmada: React.FC<CompraConfirmadaProps> = ({
  nomeTorcedor,
  email,
  numeroIngresso,
  evento,
  data,
  local,
  valor,
  pedidoId,
}) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Compra Confirmada! 🎫</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Compra Confirmada! 🎫</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nomeTorcedor}</strong>,
            </Text>

            <Text style={paragraph}>
              Sua compra de ingresso foi confirmada com sucesso!
            </Text>

            <Section style={infoBox}>
              <Text style={sectionTitle}>Detalhes do Pedido:</Text>
              <Text style={infoText}>
                <strong>Número do Pedido:</strong> {pedidoId}
              </Text>
              <Text style={infoText}>
                <strong>Número do Ingresso:</strong> {numeroIngresso}
              </Text>
            </Section>

            <Section style={infoBox}>
              <Text style={sectionTitle}>Informações do Evento:</Text>
              <Text style={infoText}>
                <strong>Evento:</strong> {evento}
              </Text>
              <Text style={infoText}>
                <strong>Data:</strong> {data}
              </Text>
              <Text style={infoText}>
                <strong>Local:</strong> {local}
              </Text>
            </Section>

            <Section style={infoBox}>
              <Text style={sectionTitle}>Valor:</Text>
              <Text style={valueText}>R$ {valor.toFixed(2)}</Text>
            </Section>

            <Text style={paragraph}>
              Guarde esse e-mail com segurança. Você precisará apresentar o
              número do ingresso na entrada do evento.
            </Text>

            <Text style={paragraph}>Obrigado por sua compra!</Text>
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

export default CompraConfirmada;

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
  margin: "15px 0",
  borderLeft: "4px solid #c41e3a",
};

const sectionTitle = {
  margin: "0 0 10px",
  color: "#333",
  fontWeight: "bold" as const,
};

const infoText = {
  margin: "4px 0",
  color: "#555",
};

const valueText = {
  margin: "4px 0",
  color: "#c41e3a",
  fontWeight: "bold" as const,
  fontSize: "18px",
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
