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

interface PagamentoAtrasadoProps {
  nome: string;
  valor: number;
  descricao: string;
  dataVencimento: string;
  linkPagamento?: string;
}

export const PagamentoAtrasado: React.FC<PagamentoAtrasadoProps> = ({
  nome,
  valor,
  descricao,
  dataVencimento,
  linkPagamento,
}) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Pagamento em Atraso ⚠️</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Pagamento em Atraso ⚠️</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Identificamos que o pagamento abaixo encontra-se em atraso.
              Regularize sua situação para evitar a suspensão dos seus
              benefícios.
            </Text>

            <Section style={alertBox}>
              <Text style={alertTitle}>Pagamento pendente:</Text>
              <Row>
                <Text style={alertLabel}>Descrição:</Text>
                <Text style={alertValue}>{descricao}</Text>
              </Row>
              <Row>
                <Text style={alertLabel}>Valor:</Text>
                <Text style={alertValue}>R$ {valor.toFixed(2)}</Text>
              </Row>
              <Row>
                <Text style={alertLabel}>Vencimento:</Text>
                <Text style={alertValue}>{dataVencimento}</Text>
              </Row>
            </Section>

            {linkPagamento && (
              <Section style={buttonSection}>
                <Button href={linkPagamento} style={button}>
                  Pagar Agora
                </Button>
              </Section>
            )}

            <Text style={disclaimerText}>
              Se você já efetuou o pagamento, por favor desconsidere este
              e-mail. A confirmação pode levar até 3 dias úteis.
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

export default PagamentoAtrasado;

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

const alertBox = {
  backgroundColor: "#ffe6e6",
  borderLeft: "4px solid #cc0000",
  padding: "15px",
  margin: "20px 0",
};

const alertTitle = {
  margin: "0 0 10px",
  color: "#7a0000",
  fontWeight: "bold" as const,
};

const alertLabel = {
  margin: "4px 0",
  color: "#555",
  fontWeight: "bold" as const,
  display: "inline-block",
  width: "100px",
};

const alertValue = {
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

const disclaimerText = {
  color: "#999",
  fontSize: "13px",
  lineHeight: "1.5",
  marginTop: "20px",
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
