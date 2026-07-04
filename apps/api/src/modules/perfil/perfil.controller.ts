import type { NextFunction, Request, Response } from "express";
import { updatePerfilBodySchema } from "./perfil.schema.js";
import { PerfilService } from "./perfil.service.js";

export class PerfilController {
  private readonly perfilService = new PerfilService();

  async me(_req: Request, res: Response, next: NextFunction) {
    try {
      const perfil = await this.perfilService.getMe();
      res.json(perfil);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updatePerfilBodySchema.parse(req.body);
      const perfil = await this.perfilService.updateMe(body);
      res.json(perfil);
    } catch (err) {
      next(err);
    }
  }
}
