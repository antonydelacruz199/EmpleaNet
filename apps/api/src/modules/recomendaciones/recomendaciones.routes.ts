import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { RecomendacionesController } from "./recomendaciones.controller.js";

const controller = new RecomendacionesController();

export const recomendacionesRouter: ExpressRouter = Router();

recomendacionesRouter.get("/", (req, res, next) => {
  void controller.list(req, res, next);
});
