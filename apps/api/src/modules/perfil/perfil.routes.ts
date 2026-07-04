import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { PerfilController } from "./perfil.controller.js";

const controller = new PerfilController();

export const perfilRouter: ExpressRouter = Router();

const rolesConPerfil = requireRoles("estudiante", "egresado", "empresa");

perfilRouter.get("/me", requireAuth, rolesConPerfil, (req, res, next) => {
  void controller.me(req, res, next);
});

perfilRouter.put("/me", requireAuth, rolesConPerfil, (req, res, next) => {
  void controller.updateMe(req, res, next);
});
