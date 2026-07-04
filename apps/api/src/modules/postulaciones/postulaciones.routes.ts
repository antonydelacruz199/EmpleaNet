import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { PostulacionesController } from "./postulaciones.controller.js";

const controller = new PostulacionesController();

export const postulacionesRouter: ExpressRouter = Router();

const rolesEstudiantiles = requireRoles("estudiante", "egresado");

postulacionesRouter.get(
  "/",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.list(req, res, next);
  },
);

postulacionesRouter.get(
  "/resumen",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.resumen(req, res, next);
  },
);

postulacionesRouter.get(
  "/empleo/:empleoId",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.estadoEmpleo(req, res, next);
  },
);

postulacionesRouter.post(
  "/",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.create(req, res, next);
  },
);
