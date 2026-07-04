import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { RecomendacionesController } from "./recomendaciones.controller.js";

const controller = new RecomendacionesController();
const estudiante = requireRoles("estudiante", "egresado");

export const recomendacionesRouter: ExpressRouter = Router();

recomendacionesRouter.get("/", requireAuth, estudiante, (req, res, next) => {
  void controller.list(req, res, next);
});

recomendacionesRouter.post(
  "/recalcular",
  requireAuth,
  estudiante,
  (req, res, next) => {
    void controller.recalcular(req, res, next);
  },
);

recomendacionesRouter.get(
  "/preferencias",
  requireAuth,
  estudiante,
  (req, res, next) => {
    void controller.getPreferencias(req, res, next);
  },
);

recomendacionesRouter.put(
  "/preferencias",
  requireAuth,
  estudiante,
  (req, res, next) => {
    void controller.updatePreferencias(req, res, next);
  },
);

recomendacionesRouter.get(
  "/coincidencia/:empleoId",
  requireAuth,
  estudiante,
  (req, res, next) => {
    void controller.coincidencia(req, res, next);
  },
);
