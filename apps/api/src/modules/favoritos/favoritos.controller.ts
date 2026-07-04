import type { NextFunction, Request, Response } from "express";
import { guardarFavoritoBodySchema } from "./favoritos.schema.js";
import { FavoritosService } from "./favoritos.service.js";

export class FavoritosController {
  private readonly service = new FavoritosService();

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

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = guardarFavoritoBodySchema.parse(req.body);
      const favorito = await this.service.add(req.auth, body);
      res.status(201).json(favorito);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const empleoId = req.params.empleoId;
      this.service.remove(req.auth, empleoId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
