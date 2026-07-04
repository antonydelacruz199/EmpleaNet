import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { requireAuth } from "../../core/middlewares/requireAuth.js";
import { AuthController } from "./auth.controller.js";

const controller = new AuthController();

export const authRouter: ExpressRouter = Router();

authRouter.post("/login", (req, res, next) => {
  void controller.login(req, res, next);
});

authRouter.post("/register", (req, res, next) => {
  void controller.register(req, res, next);
});

authRouter.post("/forgot-password", (req, res, next) => {
  controller.forgotPassword(req, res, next);
});

authRouter.post("/reset-password", (req, res, next) => {
  controller.resetPassword(req, res, next);
});

authRouter.post("/logout", requireAuth, (req, res) => {
  controller.logout(req, res);
});

authRouter.get("/me", requireAuth, (req, res, next) => {
  controller.me(req, res, next);
});
