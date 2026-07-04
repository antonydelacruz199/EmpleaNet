import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { PerfilController } from "./perfil.controller.js";

const controller = new PerfilController();

export const perfilRouter: ExpressRouter = Router();

perfilRouter.get("/me", (req, res, next) => {
  void controller.me(req, res, next);
});

perfilRouter.put("/me", (req, res, next) => {
  void controller.updateMe(req, res, next);
});
