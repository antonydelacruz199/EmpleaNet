import type { NextFunction, Request, Response } from "express";
import { loginBodySchema } from "./auth.schema.js";
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
