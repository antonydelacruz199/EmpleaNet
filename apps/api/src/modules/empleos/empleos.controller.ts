import type { NextFunction, Request, Response } from "express";
import { empleoIdParamsSchema, listEmpleosQuerySchema } from "./empleos.schema.js";
import { EmpleosService } from "./empleos.service.js";

export class EmpleosController {
  private readonly empleosService = new EmpleosService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listEmpleosQuerySchema.parse(req.query);
      const listado = await this.empleosService.list(query);
      res.json(listado);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = empleoIdParamsSchema.parse(req.params);
      const empleo = await this.empleosService.getById(params.id);
      if (empleo === null) {
        res.status(404).json({ error: "Empleo no encontrado" });
        return;
      }
      res.json(empleo);
    } catch (err) {
      next(err);
    }
  }
}
