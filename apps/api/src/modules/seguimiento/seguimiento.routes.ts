import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { SeguimientoController } from "./seguimiento.controller.js";

const controller = new SeguimientoController();

export const seguimientoRouter: ExpressRouter = Router();

const rolesEstudiantiles = requireRoles("estudiante", "egresado");

seguimientoRouter.get(
  "/resumen",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.resumen(req, res, next);
  },
);

seguimientoRouter.get(
  "/vistas",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.listVistas(req, res, next);
  },
);

seguimientoRouter.post(
  "/vistas",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.registerView(req, res, next);
  },
);
