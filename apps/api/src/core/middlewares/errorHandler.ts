import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

function httpStatus(err: unknown): number {
  if (err && typeof err === "object" && "status" in err) {
    const value = err.status;
    if (typeof value === "number") {
      return value;
    }
  }
  return 500;
}

function safeMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Error";
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: "Solicitud inválida", details: err.flatten() });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const status = httpStatus(err);
  const message = status === 500 ? "Error interno" : safeMessage(err);
  res.status(status).json({ error: message });
};
