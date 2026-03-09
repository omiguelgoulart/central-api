import { Resend } from 'resend';

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY não configurada no arquivo .env');
}

if (!emailFrom) {
  throw new Error('EMAIL_FROM não configurado no arquivo .env');
}

const resend = new Resend(resendApiKey);

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<string> {
  const response = await resend.emails.send({
    from: emailFrom!,
    to,
    subject,
    html,
  });

  if (response.error) {
    throw new Error(`Erro ao enviar e-mail: ${response.error.message}`);
  }

  if (!response.data?.id) {
    throw new Error('E-mail não retornou um id de envio');
  }

  return response.data.id;
}