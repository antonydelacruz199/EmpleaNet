import type { NextFunction, Request, Response } from "express";
import { registrarVistaBodySchema } from "./seguimiento.schema.js";
import { SeguimientoService } from "./seguimiento.service.js";

export class SeguimientoController {
  private readonly service = new SeguimientoService();

  async resumen(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      res.json(this.service.getResumen(req.auth));
    } catch (err) {
      next(err);
    }
  }

  async listVistas(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      res.json(this.service.listVistas(req.auth));
    } catch (err) {
      next(err);
    }
  }

  async registerView(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = registrarVistaBodySchema.parse(req.body);
      const vista = await this.service.registerView(req.auth, body);
      res.status(201).json({ vista });
    } catch (err) {
      next(err);
    }
  }
}
