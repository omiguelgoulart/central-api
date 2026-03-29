import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface RedefinicaoSenhaProps {
  nome: string;
  token: string;
  linkBase: string;
}

export const RedefinicaoSenha: React.FC<RedefinicaoSenhaProps> = ({
  nome,
  token,
  linkBase,
}) => {
  const link = `${linkBase}?token=${encodeURIComponent(token)}`;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Redefinição de Senha 🔐</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Redefinição de Senha 🔐</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{nome}</strong>,
            </Text>

            <Text style={paragraph}>
              Recebemos uma solicitação para redefinir a senha da sua conta.
              Clique no botão abaixo para criar uma nova senha:
            </Text>

            <Section style={buttonSection}>
              <Button href={link} style={button}>
                Redefinir Senha
              </Button>
            </Section>

            <Text style={disclaimerText}>
              Este link é válido por 1 hora. Se você não solicitou a redefinição
              de senha, ignore este e-mail — sua conta permanece segura.
            </Text>

            <Section style={divider} />

            <Text style={footerNote}>
              Se o botão não funcionar, copie e cole o link abaixo no seu
              navegador:
            </Text>
            <Text style={linkText}>{link}</Text>
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

export default RedefinicaoSenha;

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

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#c41e3a",
  color: "white",
  padding: "14px 35px",
  textDecoration: "none",
  borderRadius: "4px",
  fontWeight: "bold" as const,
  fontSize: "16px",
  display: "inline-block",
};

const disclaimerText = {
  color: "#999",
  fontSize: "13px",
  lineHeight: "1.5",
  marginTop: "20px",
};

const divider = {
  borderTop: "1px solid #eee",
  margin: "25px 0",
};

const footerNote = {
  color: "#bbb",
  fontSize: "12px",
  lineHeight: "1.4",
};

const linkText = {
  color: "#c41e3a",
  fontSize: "12px",
  wordBreak: "break-all" as const,
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
