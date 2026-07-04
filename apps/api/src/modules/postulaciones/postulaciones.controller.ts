import type { NextFunction, Request, Response } from "express";
import { crearPostulacionBodySchema } from "./postulaciones.schema.js";
import { PostulacionesService } from "./postulaciones.service.js";

export class PostulacionesController {
  private readonly service = new PostulacionesService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const result = this.service.listMine(req.auth);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resumen(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const activas = this.service.countActivas(req.auth);
      res.json({ activas });
    } catch (err) {
      next(err);
    }
  }

  async estadoEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const empleoId = req.params.empleoId;
      const result = this.service.getEstadoEmpleo(req.auth, empleoId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = crearPostulacionBodySchema.parse(req.body);
      const result = await this.service.create(req.auth, body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
