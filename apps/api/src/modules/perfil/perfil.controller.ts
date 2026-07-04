import type { NextFunction, Request, Response } from "express";
import { updatePerfilBodySchema } from "./perfil.schema.js";
import { PerfilService } from "./perfil.service.js";

export class PerfilController {
  private readonly perfilService = new PerfilService();

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const perfil = await this.perfilService.getMe(req.auth);
      res.json(perfil);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = updatePerfilBodySchema.parse(req.body);
      const perfil = await this.perfilService.updateMe(req.auth, body);
      res.json(perfil);
    } catch (err) {
      next(err);
    }
  }
}
