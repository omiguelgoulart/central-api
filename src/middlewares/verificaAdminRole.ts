import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
  adminId?: string;
  adminRole?: string;
}

function getRequestToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    const t = authorization.slice(7).trim();
    if (t) return t;
  }

  const cookie = req.headers.cookie;
  if (cookie) {
    for (const part of cookie.split(";")) {
      const [name, ...rest] = part.trim().split("=");
      if (name === "token") return rest.join("=") || null;
    }
  }

  return null;
}

export function verificaAdminRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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
      const decoded = jwt.verify(token, jwtKey) as AdminTokenPayload;

      if (!decoded.adminRole || !roles.includes(decoded.adminRole)) {
        res.status(403).json({ error: "Acesso negado" });
        return;
      }

      req.userLogadoId = decoded.adminId ?? "";
      next();
    } catch {
      res.status(401).json({ error: "Token inválido ou expirado" });
    }
  };
}
