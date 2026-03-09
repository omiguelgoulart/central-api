import { Resend } from 'resend';

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
};

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY não configurada no arquivo .env');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<string> {
  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    throw new Error('EMAIL_FROM não configurado no arquivo .env');
  }

  const response = await getResend().emails.send({
    from: emailFrom,
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