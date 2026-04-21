import cors from "cors";
import express from "express";
import type { Express } from "express";
import { env } from "./config/env.js";
import { getConexion } from "./core/db/conexion.js";
import { errorHandler } from "./core/middlewares/errorHandler.js";
import { notFound } from "./core/middlewares/notFound.js";
import { setupSecurity } from "./core/security/setupSecurity.js";
import { empleosRouter } from "./modules/empleos/empleos.routes.js";
import { fuentesRouter } from "./modules/fuentes/fuentes.routes.js";
import { perfilRouter } from "./modules/perfil/perfil.routes.js";
import { recomendacionesRouter } from "./modules/recomendaciones/recomendaciones.routes.js";

export function createApp(): Express {
  const app = express();
  getConexion();

  setupSecurity(app);
  app.use(
    cors({
      origin: env.CORS_ORIGIN ?? true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "256kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/empleos", empleosRouter);
  app.use("/api/perfil", perfilRouter);
  app.use("/api/recomendaciones", recomendacionesRouter);
  app.use("/api/fuentes", fuentesRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
