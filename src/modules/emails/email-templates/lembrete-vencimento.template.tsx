import { Body, Button, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import React from "react";

interface LembreteVencimentoProps {
  nomeTorcedor: string;
  dataVencimento: string;
  diasRestantes: number;
  link?: string;
}

export const LembreteVencimento: React.FC<LembreteVencimentoProps> = ({
  nomeTorcedor,
  dataVencimento,
  diasRestantes,
  link,
}) => {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Lembrete de Vencimento</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={title}>Olá {nomeTorcedor},</Text>

            <Text style={paragraph}>
              Este é um lembrete de que sua assinatura/serviço vencerá em{" "}
              <strong>{diasRestantes} dias</strong>.
            </Text>

            <Section style={alertBox}>
              <Text style={alertText}>
                <strong>Data de vencimento:</strong> {dataVencimento}
              </Text>
            </Section>

            <Text style={paragraph}>
              Para renovar ou atualizar suas informações, clique no botão
              abaixo:
            </Text>

            {link && (
              <Section style={buttonSection}>
                <Button href={link} style={button}>
                  Renovar Agora
                </Button>
              </Section>
            )}

            <Section style={divider} />

            <Text style={footerText}>
              Dúvidas? Entre em contato conosco respondendo este email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LembreteVencimento;

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
  padding: "20px",
  borderRadius: "8px",
};

const content = {
  padding: "0",
};

const title = {
  color: "#1a0000",
  fontSize: "18px",
  fontWeight: "bold" as const,
};

const paragraph = {
  color: "#666",
  lineHeight: "1.6",
  margin: "15px 0",
};

const alertBox = {
  backgroundColor: "#ffe6e6",
  borderLeft: "4px solid #cc0000",
  padding: "12px",
  margin: "20px 0",
};

const alertText = {
  margin: "0",
  color: "#7a0000",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#cc0000",
  color: "white",
  padding: "12px 30px",
  textDecoration: "none",
  borderRadius: "4px",
  display: "inline-block",
};

const divider = {
  borderTop: "1px solid #ddd",
  margin: "30px 0",
};

const footerText = {
  color: "#999",
  fontSize: "12px",
};
