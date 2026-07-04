import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { PerfilController } from "./perfil.controller.js";

const controller = new PerfilController();

export const perfilRouter: ExpressRouter = Router();

const rolesEstudiantiles = requireRoles("estudiante", "egresado");

perfilRouter.get("/me", requireAuth, rolesEstudiantiles, (req, res, next) => {
  void controller.me(req, res, next);
});

perfilRouter.put("/me", requireAuth, rolesEstudiantiles, (req, res, next) => {
  void controller.updateMe(req, res, next);
});
