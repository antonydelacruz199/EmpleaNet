import type { NextFunction, Request, Response } from "express";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  private readonly authService = new AuthService();

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginBodySchema.parse(req.body);
      const result = await this.authService.login(body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerBodySchema.parse(req.body);
      const result = await this.authService.register(body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const body = forgotPasswordBodySchema.parse(req.body);
      const result = this.authService.forgotPassword(body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const body = resetPasswordBodySchema.parse(req.body);
      const result = this.authService.resetPassword(body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const user = this.authService.me(req.auth);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  logout(_req: Request, res: Response) {
    res.status(204).send();
  }
}
