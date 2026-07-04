import type { NextFunction, Request, Response } from "express";
import {
  coincidenciaParamsSchema,
  preferenciasBodySchema,
  recomendacionesQuerySchema,
} from "./recomendaciones.schema.js";
import { RecommendationService } from "./recomendaciones.service.js";

export class RecomendacionesController {
  private readonly service = new RecommendationService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const query = recomendacionesQuerySchema.parse(req.query);
      res.json(await this.service.list(req.auth, query));
    } catch (err) {
      next(err);
    }
  }

  async recalcular(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      res.json(await this.service.recalcular(req.auth));
    } catch (err) {
      next(err);
    }
  }

  async coincidencia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const { empleoId } = coincidenciaParamsSchema.parse(req.params);
      res.json(await this.service.coincidencia(req.auth, empleoId));
    } catch (err) {
      next(err);
    }
  }

  async getPreferencias(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      res.json(this.service.getPreferencias(req.auth));
    } catch (err) {
      next(err);
    }
  }

  async updatePreferencias(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = preferenciasBodySchema.parse(req.body);
      res.json(await this.service.updatePreferencias(req.auth, body));
    } catch (err) {
      next(err);
    }
  }
}
