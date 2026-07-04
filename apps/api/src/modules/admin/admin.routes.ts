import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { AdminController } from "./admin.controller.js";

const controller = new AdminController();
const soloAdmin = requireRoles("administrador");

export const adminRouter: ExpressRouter = Router();

adminRouter.use(requireAuth, soloAdmin);

adminRouter.get("/empleos/resumen", (req, res, next) => {
  controller.empleosResumen(req, res, next);
});

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

adminRouter.post("/empleos/:id/validar", (req, res, next) => {
  controller.validarEmpleo(req, res, next);
});

adminRouter.post("/empleos/:id/clasificar", (req, res, next) => {
  controller.clasificarEmpleo(req, res, next);
});

adminRouter.post("/empleos/:id/publicar", (req, res, next) => {
  controller.publicarEmpleo(req, res, next);
});

adminRouter.post("/empleos/:id/rechazar", (req, res, next) => {
  controller.rechazarEmpleo(req, res, next);
});

adminRouter.post("/empleos/:id/cerrar", (req, res, next) => {
  controller.cerrarEmpleo(req, res, next);
});

adminRouter.patch("/empleos/:id/activo", (req, res, next) => {
  controller.setEmpleoActivo(req, res, next);
});

adminRouter.get("/empresas", (req, res, next) => {
  controller.listEmpresas(req, res, next);
});

adminRouter.post("/empresas", (req, res, next) => {
  controller.createEmpresa(req, res, next);
});

adminRouter.put("/empresas/:id", (req, res, next) => {
  controller.updateEmpresa(req, res, next);
});

adminRouter.get("/fuentes", (req, res, next) => {
  controller.listFuentes(req, res, next);
});

adminRouter.post("/fuentes", (req, res, next) => {
  controller.createFuente(req, res, next);
});

adminRouter.put("/fuentes/:id", (req, res, next) => {
  controller.updateFuente(req, res, next);
});

adminRouter.get("/reportes/resumen", (req, res, next) => {
  controller.reportesResumen(req, res, next);
});

adminRouter.get("/reportes/kpis", (req, res, next) => {
  controller.reportesKpis(req, res, next);
});

adminRouter.get("/reportes/usuarios", (req, res, next) => {
  controller.reporteUsuarios(req, res, next);
});

adminRouter.get("/reportes/ofertas", (req, res, next) => {
  controller.reporteOfertas(req, res, next);
});

adminRouter.get("/reportes/recomendaciones", (req, res, next) => {
  controller.reporteRecomendaciones(req, res, next);
});

adminRouter.get("/reportes/postulaciones", (req, res, next) => {
  controller.reportePostulaciones(req, res, next);
});

adminRouter.get("/estrategico/resumen", (req, res, next) => {
  controller.estrategicoResumen(req, res, next);
});

adminRouter.get("/reportes/export.csv", (req, res, next) => {
  controller.reportesExportCsv(req, res, next);
});

adminRouter.get("/reportes/export.json", (req, res, next) => {
  controller.reportesExportJson(req, res, next);
});

adminRouter.get("/usuarios", (req, res, next) => {
  controller.listUsuarios(req, res, next);
});

adminRouter.get("/usuarios/:usuarioId/perfil", (req, res, next) => {
  controller.getUsuarioPerfil(req, res, next);
});
