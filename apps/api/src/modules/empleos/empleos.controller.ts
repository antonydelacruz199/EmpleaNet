import type { NextFunction, Request, Response } from "express";
import { listEmpleosQuerySchema } from "./empleos.schema.js";
import { EmpleosService } from "./empleos.service.js";

export class EmpleosController {
  private readonly empleosService = new EmpleosService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listEmpleosQuerySchema.parse(req.query);
      const empleos = await this.empleosService.list(query);
      res.json(empleos);
    } catch (err) {
      next(err);
    }
  }
}
