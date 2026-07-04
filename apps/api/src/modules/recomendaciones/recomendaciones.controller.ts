import type { NextFunction, Request, Response } from "express";
import { recomendacionesQuerySchema } from "./recomendaciones.schema.js";
import { RecomendacionesService } from "./recomendaciones.service.js";

export class RecomendacionesController {
  private readonly recomendacionesService = new RecomendacionesService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const query = recomendacionesQuerySchema.parse(req.query);
      const resultado = await this.recomendacionesService.list(req.auth, query);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }
}
