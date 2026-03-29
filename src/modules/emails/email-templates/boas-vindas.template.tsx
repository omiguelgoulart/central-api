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

interface BoasVindasProps {
  nome: string;
  matricula: string;
}

export const BoasVindas: React.FC<BoasVindasProps> = ({ nome, matricula }) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Bem-vindo(a) à Central de Torcedores! ⚽</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>
              Bem-vindo(a) à Central de Torcedores! ⚽
            </Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Seu cadastro foi realizado com sucesso! Agora você faz parte da
              nossa comunidade de torcedores.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Sua matrícula:</strong> {matricula}
              </Text>
            </Section>

            <Text style={paragraph}>Com sua conta você pode:</Text>

            <ul style={listStyle}>
              <li style={listItem}>Comprar ingressos para os jogos</li>
              <li style={listItem}>Assinar um plano de sócio-torcedor</li>
              <li style={listItem}>Acompanhar seus pagamentos e faturas</li>
            </ul>
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

export default BoasVindas;

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

const infoText = {
  margin: "0",
  color: "#333",
};

const listStyle: React.CSSProperties = {
  color: "#666",
  lineHeight: "1.8",
};

const listItem: React.CSSProperties = {
  marginBottom: "8px",
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
