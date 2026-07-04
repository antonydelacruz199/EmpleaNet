import type { NextFunction, Request, Response } from "express";
import {
  createEmpleoAdminBodySchema,
  updateEmpleoActivoBodySchema,
  updateEmpleoAdminBodySchema,
} from "./admin.schema.js";
import { AdminService } from "./admin.service.js";

export class AdminController {
  private readonly service = new AdminService();

  listEmpleos(req: Request, res: Response, next: NextFunction) {
    try {
      const result = this.service.listEmpleos();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  getEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      const empleo = this.service.getEmpleo(req.params.id);
      res.json(empleo);
    } catch (err) {
      next(err);
    }
  }

  createEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = createEmpleoAdminBodySchema.parse(req.body);
      const empleo = this.service.createEmpleo(req.auth, body);
      res.status(201).json(empleo);
    } catch (err) {
      next(err);
    }
  }

  updateEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = updateEmpleoAdminBodySchema.parse(req.body);
      const empleo = this.service.updateEmpleo(req.auth, req.params.id, body);
      res.json(empleo);
    } catch (err) {
      next(err);
    }
  }

  setEmpleoActivo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = updateEmpleoActivoBodySchema.parse(req.body);
      const empleo = this.service.setEmpleoActivo(req.auth, req.params.id, body);
      res.json(empleo);
    } catch (err) {
      next(err);
    }
  }

  reportesResumen(req: Request, res: Response, next: NextFunction) {
    try {
      const resumen = this.service.getReportesResumen();
      res.json(resumen);
    } catch (err) {
      next(err);
    }
  }

  estrategicoResumen(req: Request, res: Response, next: NextFunction) {
    try {
      const resumen = this.service.getEstrategicoResumen();
      res.json(resumen);
    } catch (err) {
      next(err);
    }
  }

  reportesExportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const resumen = this.service.getReportesResumen();
      const csv = this.service.buildReportesCsv(resumen);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="reportes-continental-oportunidades.csv"',
      );
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }
}
