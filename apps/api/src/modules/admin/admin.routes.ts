import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { AdminController } from "./admin.controller.js";

const controller = new AdminController();
const soloAdmin = requireRoles("administrador");

export const adminRouter: ExpressRouter = Router();

adminRouter.use(requireAuth, soloAdmin);

adminRouter.get("/empleos", (req, res, next) => {
  controller.listEmpleos(req, res, next);
});

adminRouter.get("/empleos/:id", (req, res, next) => {
  controller.getEmpleo(req, res, next);
});

adminRouter.post("/empleos", (req, res, next) => {
  controller.createEmpleo(req, res, next);
});

adminRouter.put("/empleos/:id", (req, res, next) => {
  controller.updateEmpleo(req, res, next);
});

adminRouter.patch("/empleos/:id/activo", (req, res, next) => {
  controller.setEmpleoActivo(req, res, next);
});

adminRouter.get("/reportes/resumen", (req, res, next) => {
  controller.reportesResumen(req, res, next);
});

adminRouter.get("/estrategico/resumen", (req, res, next) => {
  controller.estrategicoResumen(req, res, next);
});

adminRouter.get("/reportes/export.csv", (req, res, next) => {
  controller.reportesExportCsv(req, res, next);
});
