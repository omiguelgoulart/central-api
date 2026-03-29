import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface FaturaGeradaProps {
  nome: string;
  plano: string;
  competencia: string;
  valor: number;
  vencimentoEm: string;
  linkPagamento?: string;
}

export const FaturaGerada: React.FC<FaturaGeradaProps> = ({
  nome,
  plano,
  competencia,
  valor,
  vencimentoEm,
  linkPagamento,
}) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Nova Fatura Disponível 📋</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Nova Fatura Disponível 📋</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Uma nova fatura referente à sua assinatura foi gerada.
            </Text>

            <Section style={infoBox}>
              <Text style={sectionTitle}>Detalhes da Fatura:</Text>
              <Row>
                <Text style={infoLabel}>Plano:</Text>
                <Text style={infoValue}>{plano}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Competência:</Text>
                <Text style={infoValue}>{competencia}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Valor:</Text>
                <Text style={infoValue}>R$ {valor.toFixed(2)}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Vencimento:</Text>
                <Text style={infoValue}>{vencimentoEm}</Text>
              </Row>
            </Section>

            {linkPagamento && (
              <Section style={buttonSection}>
                <Button href={linkPagamento} style={button}>
                  Pagar Fatura
                </Button>
              </Section>
            )}
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

export default FaturaGerada;

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

const sectionTitle = {
  margin: "0 0 10px",
  color: "#333",
  fontWeight: "bold" as const,
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

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#c41e3a",
  color: "white",
  padding: "12px 30px",
  textDecoration: "none",
  borderRadius: "4px",
  fontWeight: "bold" as const,
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
