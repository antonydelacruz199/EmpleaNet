import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import type { AuthUser, JwtPayload } from "./types.js";

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signAccessToken(user: AuthUser): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    ...user,
    iat: now,
    exp: now + env.JWT_EXPIRES_IN_SECONDS,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const signature = createHmac("sha256", env.JWT_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifyAccessToken(token: string): AuthUser {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token inválido");
  }
  const [header, body, signature] = parts;
  const data = `${header}.${body}`;
  const expected = createHmac("sha256", env.JWT_SECRET)
    .update(data)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error("Token inválido");
  }

  const payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error("Token expirado");
  }

  return {
    userId: payload.userId,
    email: payload.email,
    rol: payload.rol,
    perfilId: payload.perfilId,
  };
}
