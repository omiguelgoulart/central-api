import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from 'express'

interface TokenI {
  userLogadoId: number
  userLogadoNome: string
}

const TOKEN_COOKIE_NAME = "token"

function getTokenFromCookieHeader(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=')
    if (name === TOKEN_COOKIE_NAME) {
      return valueParts.join('=')
    }
  }

  return null
}

function getTokenFromAuthorizationHeader(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authorizationHeader.slice('Bearer '.length).trim()
  return token || null
}

export function verificaToken(req: Request | any, res: Response, next: NextFunction) {
  const authorizationHeader = typeof req.headers.authorization === 'string'
    ? req.headers.authorization
    : undefined
  const cookieHeader = typeof req.headers.cookie === 'string'
    ? req.headers.cookie
    : undefined

  const token = getTokenFromCookieHeader(cookieHeader) ?? getTokenFromAuthorizationHeader(authorizationHeader)

  if (!token) {
    res.status(401).json({ error: "Token não informado" })
    return
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_KEY as string)
    const { userLogadoId, userLogadoNome } = decode as TokenI

    req.userLogadoId   = userLogadoId
    req.userLogadoNome = userLogadoNome

    next()
  } catch (error) {
    res.status(401).json({ error: "Token inválido" })
  }
}