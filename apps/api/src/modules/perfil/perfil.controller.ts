import type { NextFunction, Request, Response } from "express";
import {
  createExperienciaBodySchema,
  updateExperienciaBodySchema,
  updateInteresesBodySchema,
  updatePerfilBodySchema,
  updateSkillsBodySchema,
  uploadCvBodySchema,
} from "./perfil.schema.js";
import { PerfilService } from "./perfil.service.js";

export class PerfilController {
  private readonly perfilService = new PerfilService();

  me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const perfil = this.perfilService.getMe(req.auth);
      void perfil.then((data) => res.json(data)).catch(next);
    } catch (err) {
      next(err);
    }
  }

  completitud(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      void this.perfilService
        .getCompletitud(req.auth)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      const body = updatePerfilBodySchema.parse(req.body);
      void this.perfilService
        .updateMe(req.auth, body)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  updateSkills(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = updateSkillsBodySchema.parse(req.body);
      void this.perfilService
        .updateSkills(req.auth, body)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  updateIntereses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = updateInteresesBodySchema.parse(req.body);
      void this.perfilService
        .updateIntereses(req.auth, body)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  addExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = createExperienciaBodySchema.parse(req.body);
      void this.perfilService
        .addExperiencia(req.auth, body)
        .then((data) => res.status(201).json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  updateExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const expId = Number(req.params.id);
      const body = updateExperienciaBodySchema.parse(req.body);
      void this.perfilService
        .updateExperiencia(req.auth, expId, body)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  deleteExperiencia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const expId = Number(req.params.id);
      void this.perfilService
        .deleteExperiencia(req.auth, expId)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  uploadCv(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const body = uploadCvBodySchema.parse(req.body);
      void this.perfilService
        .uploadCv(req.auth, body)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  downloadCv(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      const file = this.perfilService.getCvFile(req.auth);
      res.download(file.path, file.nombre, (err) => {
        if (err && !res.headersSent) next(err);
      });
    } catch (err) {
      next(err);
    }
  }

  deleteCv(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) return void res.status(401).json({ error: "Autenticación requerida" });
      void this.perfilService
        .deleteCv(req.auth)
        .then((data) => res.json(data))
        .catch(next);
    } catch (err) {
      next(err);
    }
  }

  listCarreras(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.perfilService.listCarreras());
    } catch (err) {
      next(err);
    }
  }
}
