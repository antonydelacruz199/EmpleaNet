import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt.js";
import type { RolUsuario } from "../auth/types.js";
import { AppError } from "../errors/AppError.js";

declare global {
  namespace Express {
    interface Request {
      auth?: import("../auth/types.js").AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Autenticación requerida"));
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Sesión inválida o expirada"));
  }
}

export function requireRoles(...roles: RolUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new AppError(401, "Autenticación requerida"));
      return;
    }
    if (!roles.includes(req.auth.rol)) {
      next(new AppError(403, "No tienes permiso para esta acción"));
      return;
    }
    next();
  };
}
