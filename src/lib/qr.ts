import crypto from "crypto";
import QRCode from "qrcode";

export type QrPayload = {
  t: "ING";     // tipo do QR
  id: string;   // id do ingresso no banco
  tok: string;  // token salvo em ingresso.qrCode
  v: number;    // versão do payload
};

/** Gera um token seguro e curto para ser salvo em ingresso.qrCode */
export function genQrToken(): string {
  return crypto.randomUUID(); // ou: crypto.randomBytes(24).toString("base64url")
}

/** Monta o payload do QR que será codificado na imagem */
export function buildQrPayload(ingressoId: string, qrToken: string): QrPayload {
  return { t: "ING", id: ingressoId, tok: qrToken, v: 1 };
}

/** Gera uma DataURL (base64) com o QR */
export async function toDataURL(payload: QrPayload): Promise<string> {
  return QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 5,
  });
}

/** Gera um Buffer PNG (útil para responder como image/png) */
export async function toPNG(payload: QrPayload): Promise<Buffer> {
  return QRCode.toBuffer(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 5,
    type: "png",
  });
}
