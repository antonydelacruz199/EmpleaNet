import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { EmpleosRepository } from "../empleos/empleos.repository.js";
import type {
  Favorito,
  FavoritoEstadoEmpleo,
  GuardarFavoritoBody,
  ListFavoritosResult,
} from "./favoritos.schema.js";
import { FavoritosRepository } from "./favoritos.repository.js";

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

export class FavoritosService {
  private readonly repository = new FavoritosRepository();
  private readonly empleosRepository = new EmpleosRepository();

  listMine(auth: AuthUser): ListFavoritosResult {
    const perfilId = requirePerfilId(auth);
    const favoritos = this.repository.findByPerfil(perfilId);
    return { favoritos, total: favoritos.length };
  }

  getEstadoEmpleo(auth: AuthUser, empleoIdRaw: string): FavoritoEstadoEmpleo {
    const perfilId = requirePerfilId(auth);
    const empleoId = parseEmpleoId(empleoIdRaw);
    return this.repository.getEstadoEmpleo(perfilId, empleoId);
  }

  async add(auth: AuthUser, body: GuardarFavoritoBody): Promise<Favorito> {
    const perfilId = requirePerfilId(auth);
    const empleoId = parseEmpleoId(body.empleoId);

    const empleo = await this.empleosRepository.findById(String(empleoId));
    if (!empleo) {
      throw new AppError(404, "Oferta no encontrada");
    }

    return this.repository.add(perfilId, empleoId);
  }

  remove(auth: AuthUser, empleoIdRaw: string): void {
    const perfilId = requirePerfilId(auth);
    const empleoId = parseEmpleoId(empleoIdRaw);
    this.repository.remove(perfilId, empleoId);
  }
}
