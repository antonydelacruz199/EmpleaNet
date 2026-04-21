import type { NextFunction, Request, Response } from "express";
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
}
