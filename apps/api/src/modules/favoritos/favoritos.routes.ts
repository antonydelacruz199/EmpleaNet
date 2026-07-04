import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth, requireRoles } from "../../core/middlewares/requireAuth.js";
import { FavoritosController } from "./favoritos.controller.js";

const controller = new FavoritosController();

export const favoritosRouter: ExpressRouter = Router();

const rolesEstudiantiles = requireRoles("estudiante", "egresado");

favoritosRouter.get("/", requireAuth, rolesEstudiantiles, (req, res, next) => {
  void controller.list(req, res, next);
});

favoritosRouter.get(
  "/empleo/:empleoId",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.estadoEmpleo(req, res, next);
  },
);

favoritosRouter.post("/", requireAuth, rolesEstudiantiles, (req, res, next) => {
  void controller.add(req, res, next);
});

favoritosRouter.delete(
  "/:empleoId",
  requireAuth,
  rolesEstudiantiles,
  (req, res, next) => {
    void controller.remove(req, res, next);
  },
);
