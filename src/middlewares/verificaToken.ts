import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface TokenPayload {
  userLogadoId: number;
  userLogadoNome: string;
}

interface AuthenticatedRequest extends Request {
  userLogadoId?: number;
  userLogadoNome?: string;
}

const TOKEN_COOKIE_NAME = "token";

function getTokenFromCookieHeader(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === TOKEN_COOKIE_NAME) {
      return valueParts.join("=");
    }
  }

  return null;
}

function getTokenFromAuthorizationHeader(
  authorizationHeader?: string
): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

function getRequestToken(req: Request): string | null {
  const authorizationHeader =
    typeof req.headers.authorization === "string"
      ? req.headers.authorization
      : undefined;

  const cookieHeader =
    typeof req.headers.cookie === "string"
      ? req.headers.cookie
      : undefined;

  return (
    getTokenFromCookieHeader(cookieHeader) ??
    getTokenFromAuthorizationHeader(authorizationHeader)
  );
}

export function verificaToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = getRequestToken(req);

  if (!token) {
    res.status(401).json({ error: "Token não informado" });
    return;
  }

  const jwtKey = process.env.JWT_KEY;

  if (!jwtKey) {
    res.status(500).json({ error: "JWT_KEY não configurada" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtKey) as TokenPayload;

    req.userLogadoId = decoded.userLogadoId;
    req.userLogadoNome = decoded.userLogadoNome;

    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}