import { PERFIL_DEMO_ID } from "../perfil/perfil.schema.js";
import type { RecomendacionesQuery } from "./recomendaciones.schema.js";
import { RecomendacionesRepository } from "./recomendaciones.repository.js";

export class RecomendacionesService {
  private readonly recomendacionesRepository = new RecomendacionesRepository();

  async recalcularParaPerfil(perfilId: number) {
    const perfil =
      perfilId === PERFIL_DEMO_ID
        ? this.recomendacionesRepository.getPerfilDemo()
        : null;

    if (!perfil) return;

    const empleos = await this.recomendacionesRepository.findAllEmpleos();
    const scores = this.recomendacionesRepository.buildScoresFromEmpleos(
      perfil,
      empleos,
    );
    this.recomendacionesRepository.replaceScores(perfilId, scores);
  }

  async list(query: RecomendacionesQuery) {
    const perfilId = PERFIL_DEMO_ID;
    const perfil = this.recomendacionesRepository.getPerfilDemo();

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
