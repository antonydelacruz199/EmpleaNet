import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { PerfilController } from "./perfil.controller.js";

const controller = new PerfilController();
const rolesPerfil = requireRoles("estudiante", "egresado");
const rolesConPerfil = requireRoles("estudiante", "egresado", "empresa");

export const perfilRouter: ExpressRouter = Router();

perfilRouter.get("/carreras", requireAuth, rolesPerfil, (req, res, next) => {
  controller.listCarreras(req, res, next);
});

perfilRouter.get("/me", requireAuth, rolesConPerfil, (req, res, next) => {
  controller.me(req, res, next);
});

perfilRouter.get("/me/completitud", requireAuth, rolesPerfil, (req, res, next) => {
  controller.completitud(req, res, next);
});

perfilRouter.put("/me", requireAuth, rolesConPerfil, (req, res, next) => {
  controller.updateMe(req, res, next);
});

perfilRouter.put("/me/habilidades", requireAuth, rolesPerfil, (req, res, next) => {
  controller.updateSkills(req, res, next);
});

perfilRouter.put("/me/intereses", requireAuth, rolesPerfil, (req, res, next) => {
  controller.updateIntereses(req, res, next);
});

perfilRouter.post("/me/experiencia", requireAuth, rolesPerfil, (req, res, next) => {
  controller.addExperiencia(req, res, next);
});

perfilRouter.put("/me/experiencia/:id", requireAuth, rolesPerfil, (req, res, next) => {
  controller.updateExperiencia(req, res, next);
});

perfilRouter.delete("/me/experiencia/:id", requireAuth, rolesPerfil, (req, res, next) => {
  controller.deleteExperiencia(req, res, next);
});

perfilRouter.post("/me/cv", requireAuth, rolesPerfil, (req, res, next) => {
  controller.uploadCv(req, res, next);
});

perfilRouter.get("/me/cv", requireAuth, rolesPerfil, (req, res, next) => {
  controller.downloadCv(req, res, next);
});

perfilRouter.delete("/me/cv", requireAuth, rolesPerfil, (req, res, next) => {
  controller.deleteCv(req, res, next);
});
