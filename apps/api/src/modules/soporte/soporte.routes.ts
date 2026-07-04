import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { SoporteController } from "./soporte.controller.js";

const controller = new SoporteController();
const soloSoporte = requireRoles("soporte");

export const soporteRouter: ExpressRouter = Router();

soporteRouter.use(requireAuth, soloSoporte);

soporteRouter.get("/motor/config", (req, res, next) => {
  controller.getMotorConfig(req, res, next);
});

soporteRouter.put("/motor/config", (req, res, next) => {
  controller.updateMotorConfig(req, res, next);
});

soporteRouter.post("/motor/recalcular", (req, res, next) => {
  controller.recalcularMotor(req, res, next);
});

soporteRouter.get("/incidencias", (req, res, next) => {
  controller.listIncidencias(req, res, next);
});

soporteRouter.post("/incidencias", (req, res, next) => {
  controller.createIncidencia(req, res, next);
});

soporteRouter.patch("/incidencias/:id/estado", (req, res, next) => {
  controller.updateIncidenciaEstado(req, res, next);
});

soporteRouter.get("/auditoria", (req, res, next) => {
  controller.listAuditoria(req, res, next);
});
