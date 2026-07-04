import type { NextFunction, Request, Response } from "express";
import {
  clasificarOfertaBodySchema,
  createEmpresaBodySchema,
  createFuenteBodySchema,
  createOfertaBodySchema,
  listOfertasAdminQuerySchema,
  rechazarOfertaBodySchema,
  updateEmpresaBodySchema,
  updateFuenteBodySchema,
  updateOfertaBodySchema,
} from "../ofertas/ofertas.schema.js";
import { AdminService } from "./admin.service.js";

export class AdminController {
  private readonly service = new AdminService();

  listEmpleos(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listOfertasAdminQuerySchema.parse(req.query);
      res.json(this.service.listEmpleos(query));
    } catch (err) {
      next(err);
    }
  }

  empleosResumen(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.empleosResumen());
    } catch (err) {
      next(err);
    }
  }

  getEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.getEmpleo(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  createEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = createOfertaBodySchema.parse(req.body);
      const empleo = this.service.createEmpleo(req.auth, body);
      res.status(201).json(empleo);
    } catch (err) {
      next(err);
    }
  }

  updateEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = updateOfertaBodySchema.parse(req.body);
      res.json(this.service.updateEmpleo(req.auth, req.params.id, body));
    } catch (err) {
      next(err);
    }
  }

  validarEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      res.json(this.service.validarEmpleo(req.auth, req.params.id));
    } catch (err) {
      next(err);
    }
  }

  clasificarEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = clasificarOfertaBodySchema.parse(req.body);
      res.json(this.service.clasificarEmpleo(req.auth, req.params.id, body));
    } catch (err) {
      next(err);
    }
  }

  publicarEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      res.json(this.service.publicarEmpleo(req.auth, req.params.id));
    } catch (err) {
      next(err);
    }
  }

  rechazarEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = rechazarOfertaBodySchema.parse(req.body);
      res.json(this.service.rechazarEmpleo(req.auth, req.params.id, body));
    } catch (err) {
      next(err);
    }
  }

  cerrarEmpleo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      res.json(this.service.cerrarEmpleo(req.auth, req.params.id));
    } catch (err) {
      next(err);
    }
  }

  setEmpleoActivo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const activo = Boolean(req.body?.activo);
      res.json(this.service.setEmpleoActivo(req.auth, req.params.id, activo));
    } catch (err) {
      next(err);
    }
  }

  listEmpresas(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.listEmpresas());
    } catch (err) {
      next(err);
    }
  }

  createEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = createEmpresaBodySchema.parse(req.body);
      res.status(201).json(this.service.createEmpresa(req.auth, body));
    } catch (err) {
      next(err);
    }
  }

  updateEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = updateEmpresaBodySchema.parse(req.body);
      res.json(this.service.updateEmpresa(req.auth, req.params.id, body));
    } catch (err) {
      next(err);
    }
  }

  listFuentes(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.listFuentes());
    } catch (err) {
      next(err);
    }
  }

  createFuente(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = createFuenteBodySchema.parse(req.body);
      res.status(201).json(this.service.createFuente(req.auth, body));
    } catch (err) {
      next(err);
    }
  }

  updateFuente(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = updateFuenteBodySchema.parse(req.body);
      res.json(this.service.updateFuente(req.auth, req.params.id, body));
    } catch (err) {
      next(err);
    }
  }

  reportesResumen(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.getReportesResumen());
    } catch (err) {
      next(err);
    }
  }

  estrategicoResumen(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.service.getEstrategicoResumen());
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

  listUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, Number(req.query.page ?? 1));
      const data = this.service.listUsuariosPerfil(page);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  getUsuarioPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const perfil = this.service.getUsuarioPerfil(usuarioId);
      res.json(perfil);
    } catch (err) {
      next(err);
    }
  }
}
