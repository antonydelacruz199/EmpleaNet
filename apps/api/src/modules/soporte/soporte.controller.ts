import type { NextFunction, Request, Response } from "express";
import {
  actualizarIncidenciaEstadoSchema,
  crearIncidenciaBodySchema,
  motorConfigBodySchema,
} from "./soporte.schema.js";
import { SoporteService } from "./soporte.service.js";

export class SoporteController {
  private readonly service = new SoporteService();

  getMotorConfig(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.getMotorConfig());
    } catch (err) {
      next(err);
    }
  }

  updateMotorConfig(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = motorConfigBodySchema.parse(req.body);
      const config = this.service.updateMotorConfig(req.auth, body);
      res.json(config);
    } catch (err) {
      next(err);
    }
  }

  recalcularMotor(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      void this.service
        .recalcularRecomendaciones(req.auth)
        .then((result) => res.json(result))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  listIncidencias(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.listIncidencias());
    } catch (err) {
      next(err);
    }
  }

  createIncidencia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = crearIncidenciaBodySchema.parse(req.body);
      const incidencia = this.service.createIncidencia(req.auth, body);
      res.status(201).json(incidencia);
    } catch (err) {
      next(err);
    }
  }

  updateIncidenciaEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const body = actualizarIncidenciaEstadoSchema.parse(req.body);
      const incidencia = this.service.updateIncidenciaEstado(req.params.id, body);
      res.json(incidencia);
    } catch (err) {
      next(err);
    }
  }

  listAuditoria(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      res.json(this.service.listAuditoria(limit));
    } catch (err) {
      next(err);
    }
  }
}
