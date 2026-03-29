import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface AssinaturaCanceladaProps {
  nome: string;
  plano: string;
  canceladaEm: string;
  motivo?: string;
}

export const AssinaturaCancelada: React.FC<AssinaturaCanceladaProps> = ({
  nome,
  plano,
  canceladaEm,
  motivo,
}) => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Sua assinatura foi cancelada</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Assinatura Cancelada</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Informamos que sua assinatura foi cancelada.
            </Text>

            <Section style={infoBox}>
              <Row>
                <Text style={infoLabel}>Plano:</Text>
                <Text style={infoValue}>{plano}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Cancelado em:</Text>
                <Text style={infoValue}>{canceladaEm}</Text>
              </Row>
              {motivo && (
                <Row>
                  <Text style={infoLabel}>Motivo:</Text>
                  <Text style={infoValue}>{motivo}</Text>
                </Row>
              )}
            </Section>

            <Text style={paragraph}>
              Sentiremos sua falta! Caso mude de ideia, você pode reativar sua
              assinatura a qualquer momento.
            </Text>
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

export default AssinaturaCancelada;

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
};

const infoBox = {
  backgroundColor: "#f9f9f9",
  padding: "15px",
  margin: "20px 0",
  borderLeft: "4px solid #c41e3a",
};

const infoLabel = {
  margin: "4px 0",
  color: "#555",
  fontWeight: "bold" as const,
  display: "inline-block",
  width: "100px",
};

const infoValue = {
  margin: "4px 0",
  color: "#555",
  display: "inline-block",
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
