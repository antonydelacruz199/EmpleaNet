import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { FuentesController } from "./fuentes.controller.js";

const controller = new FuentesController();

export const fuentesRouter: ExpressRouter = Router();

fuentesRouter.get("/", (req, res, next) => {
  void controller.list(req, res, next);
});
