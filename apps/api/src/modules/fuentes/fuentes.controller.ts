import type { NextFunction, Request, Response } from "express";
import { FuentesService } from "./fuentes.service.js";

export class FuentesController {
  private readonly fuentesService = new FuentesService();

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const fuentes = await this.fuentesService.list();
      res.json(fuentes);
    } catch (err) {
      next(err);
    }
  }
}
