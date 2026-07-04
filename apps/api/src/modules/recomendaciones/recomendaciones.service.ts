import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import type { RecomendacionesQuery } from "./recomendaciones.schema.js";
import { RecomendacionesRepository } from "./recomendaciones.repository.js";

export class RecomendacionesService {
  private readonly recomendacionesRepository = new RecomendacionesRepository();

  async recalcularParaPerfil(perfilId: number) {
    const perfil = this.recomendacionesRepository.getPerfilById(perfilId);
    if (!perfil) return;

    const empleos = await this.recomendacionesRepository.findAllEmpleos();
    const scores = this.recomendacionesRepository.buildScoresFromEmpleos(
      perfil,
      empleos,
    );
    this.recomendacionesRepository.replaceScores(perfilId, scores);
  }

  async list(auth: AuthUser, query: RecomendacionesQuery) {
    if (!auth.perfilId) {
      throw new AppError(404, "Perfil no disponible para recomendaciones");
    }

    const perfilId = auth.perfilId;
    const perfil = this.recomendacionesRepository.getPerfilById(perfilId);

    if (!perfil) {
      return { recomendaciones: [] };
    }

    const existentes = this.recomendacionesRepository.countByPerfil(perfilId);
    if (existentes === 0) {
      await this.recalcularParaPerfil(perfilId);
    }

    const recomendaciones = this.recomendacionesRepository.findByPerfil(
      perfilId,
      query.limit,
    );

    return { recomendaciones };
  }
}
