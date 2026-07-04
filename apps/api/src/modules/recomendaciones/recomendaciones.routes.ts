import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { RecomendacionesController } from "./recomendaciones.controller.js";

const controller = new RecomendacionesController();

export const recomendacionesRouter: ExpressRouter = Router();

recomendacionesRouter.get(
  "/",
  requireAuth,
  requireRoles("estudiante", "egresado"),
  (req, res, next) => {
    void controller.list(req, res, next);
  },
);
