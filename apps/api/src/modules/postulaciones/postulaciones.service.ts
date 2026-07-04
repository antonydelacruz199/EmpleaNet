import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { EmpleosRepository } from "../empleos/empleos.repository.js";
import { PerfilRepository } from "../perfil/perfil.repository.js";
import type {
  CrearPostulacionBody,
  CrearPostulacionResult,
  ListPostulacionesResult,
  PostulacionEstadoEmpleo,
} from "./postulaciones.schema.js";
import { PostulacionesRepository } from "./postulaciones.repository.js";

function parseEmpleoId(raw: string | number): number {
  const id = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "Identificador de empleo no válido");
  }
  return id;
}

function requirePerfilId(auth: AuthUser): number {
  if (auth.perfilId === null) {
    throw new AppError(404, "Perfil no encontrado");
  }
  return auth.perfilId;
}

export class PostulacionesService {
  private readonly repository = new PostulacionesRepository();
  private readonly empleosRepository = new EmpleosRepository();
  private readonly perfilRepository = new PerfilRepository();

  listMine(auth: AuthUser): ListPostulacionesResult {
    const perfilId = requirePerfilId(auth);
    const postulaciones = this.repository.findByPerfil(perfilId);
    return { postulaciones, total: postulaciones.length };
  }

  getEstadoEmpleo(auth: AuthUser, empleoIdRaw: string): PostulacionEstadoEmpleo {
    const perfilId = requirePerfilId(auth);
    const empleoId = parseEmpleoId(empleoIdRaw);
    return this.repository.getEstadoEmpleo(perfilId, empleoId);
  }

  countActivas(auth: AuthUser): number {
    const perfilId = requirePerfilId(auth);
    return this.repository.countActivasByPerfil(perfilId);
  }

  async create(auth: AuthUser, body: CrearPostulacionBody): Promise<CrearPostulacionResult> {
    const perfilId = requirePerfilId(auth);
    const empleoId = parseEmpleoId(body.empleoId);

    const perfil = this.perfilRepository.findById(perfilId);
    if (!perfil || perfil.skills.length === 0) {
      throw new AppError(
        422,
        "Completa tu perfil con al menos una habilidad antes de postular",
      );
    }

    const empleo = await this.empleosRepository.findById(String(empleoId));
    if (!empleo) {
      throw new AppError(404, "Oferta no encontrada");
    }

    const postulacion = this.repository.create(perfilId, empleoId);
    return {
      postulacion,
      urlOferta: empleo.urlOferta,
    };
  }
}
