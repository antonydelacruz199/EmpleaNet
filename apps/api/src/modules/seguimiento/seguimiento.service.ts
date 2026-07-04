import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { EmpleosRepository } from "../empleos/empleos.repository.js";
import { FavoritosRepository } from "../favoritos/favoritos.repository.js";
import { PostulacionesRepository } from "../postulaciones/postulaciones.repository.js";
import type {
  ListVistasResult,
  RegistrarVistaBody,
  SeguimientoResumen,
} from "./seguimiento.schema.js";
import { SeguimientoRepository } from "./seguimiento.repository.js";
import type { OportunidadVista } from "./seguimiento.schema.js";

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

export class SeguimientoService {
  private readonly repository = new SeguimientoRepository();
  private readonly postulacionesRepository = new PostulacionesRepository();
  private readonly favoritosRepository = new FavoritosRepository();
  private readonly empleosRepository = new EmpleosRepository();

  listVistas(auth: AuthUser): ListVistasResult {
    const perfilId = requirePerfilId(auth);
    const vistas = this.repository.findByPerfil(perfilId);
    return { vistas, total: vistas.length };
  }

  getResumen(auth: AuthUser): SeguimientoResumen {
    const perfilId = requirePerfilId(auth);
    const postulaciones = this.postulacionesRepository.findByPerfil(perfilId);
    return {
      postulaciones: postulaciones.length,
      postulacionesActivas: this.postulacionesRepository.countActivasByPerfil(perfilId),
      favoritos: this.favoritosRepository.findByPerfil(perfilId).length,
      vistas: this.repository.countByPerfil(perfilId),
    };
  }

  async registerView(auth: AuthUser, body: RegistrarVistaBody): Promise<OportunidadVista> {
    const perfilId = requirePerfilId(auth);
    const empleoId = parseEmpleoId(body.empleoId);

    const empleo = await this.empleosRepository.findById(String(empleoId));
    if (!empleo) {
      throw new AppError(404, "Oferta no encontrada");
    }

    return this.repository.registerView(perfilId, empleoId);
  }
}
