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

interface PagamentoConfirmadoProps {
  nome: string;
  valor: number;
  descricao: string;
  metodo: string;
  dataConfirmacao: string;
  referencia?: string;
}

export const PagamentoConfirmado: React.FC<PagamentoConfirmadoProps> = ({
  nome,
  valor,
  descricao,
  metodo,
  dataConfirmacao,
  referencia,
}) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Pagamento Confirmado ✅</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Pagamento Confirmado ✅</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Seu pagamento foi recebido e confirmado com sucesso!
            </Text>

            <Section style={infoBox}>
              <Text style={sectionTitle}>Detalhes:</Text>
              <Row>
                <Text style={infoLabel}>Descrição:</Text>
                <Text style={infoValue}>{descricao}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Valor:</Text>
                <Text style={infoValue}>R$ {valor.toFixed(2)}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Método:</Text>
                <Text style={infoValue}>{metodo}</Text>
              </Row>
              <Row>
                <Text style={infoLabel}>Data:</Text>
                <Text style={infoValue}>{dataConfirmacao}</Text>
              </Row>
              {referencia && (
                <Row>
                  <Text style={infoLabel}>Referência:</Text>
                  <Text style={infoValue}>{referencia}</Text>
                </Row>
              )}
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

export default PagamentoConfirmado;

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
  width: "110px",
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
