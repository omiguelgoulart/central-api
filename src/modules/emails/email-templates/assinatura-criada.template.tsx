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

interface AssinaturaCriadaProps {
  nome: string;
  plano: string;
  valor: number;
  periodicidade: string;
  inicioEm: string;
  proximaCobranca?: string;
}

export const AssinaturaCriada: React.FC<AssinaturaCriadaProps> = ({
  nome,
  plano,
  valor,
  periodicidade,
  inicioEm,
  proximaCobranca,
}) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Sua assinatura foi ativada com sucesso! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Assinatura Ativada! 🎉</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Sua assinatura de sócio-torcedor foi ativada com sucesso! Agora
              você tem acesso a todos os benefícios do seu plano.
            </Text>

            <Section style={infoBox}>
              <Text style={infoTitle}>Detalhes da Assinatura:</Text>
              <Row>
                <Text style={infoLabel}>Plano:</Text>
                <Text style={infoValue}>{plano}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Valor:</Text>
                <Text style={infoValue}>
                  R$ {valor.toFixed(2)} / {periodicidade.toLowerCase()}
                </Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Início:</Text>
                <Text style={infoValue}>{inicioEm}</Text>
              </Row>
              {proximaCobranca && (
                <Row>
                  <Text style={infoLabel}>Próxima cobrança:</Text>
                  <Text style={infoValue}>{proximaCobranca}</Text>
                </Row>
              )}
            </Section>

            <Text style={paragraph}>
              Aproveite todos os benefícios exclusivos do seu plano!
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

export default AssinaturaCriada;

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

const infoTitle = {
  margin: "0 0 10px",
  color: "#333",
  fontWeight: "bold" as const,
};

const infoLabel = {
  margin: "4px 0",
  color: "#555",
  fontWeight: "bold" as const,
  display: "inline-block",
  width: "140px",
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
