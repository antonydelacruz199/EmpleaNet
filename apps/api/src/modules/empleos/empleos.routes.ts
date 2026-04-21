import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { EmpleosController } from "./empleos.controller.js";

const controller = new EmpleosController();

export const empleosRouter: ExpressRouter = Router();

empleosRouter.get("/", (req, res, next) => {
  void controller.list(req, res, next);
});
