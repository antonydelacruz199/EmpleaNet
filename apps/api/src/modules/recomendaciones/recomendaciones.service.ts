import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import type {
  PreferenciasBody,
  RecomendacionesQuery,
} from "./recomendaciones.schema.js";
import { RecomendacionesRepository } from "./recomendaciones.repository.js";
import {
  calcularRecomendacion,
  interpretarNivel,
  normalizarPesos,
} from "./recommendation.engine.js";
import { MotorConfigRepository } from "../soporte/motor-config.repository.js";

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "Identificador no válido");
  }
  return id;
}

/** Servicio O3: búsqueda personalizada y motor de recomendación */
export class RecommendationService {
  private readonly repo = new RecomendacionesRepository();
  private readonly motorConfig = new MotorConfigRepository();

  private requirePerfilId(auth: AuthUser): number {
    if (!auth.perfilId) {
      throw new AppError(404, "Perfil no disponible para recomendaciones");
    }
    return auth.perfilId;
  }

  async recalcularParaPerfil(perfilId: number): Promise<number> {
    const perfil = this.repo.getPerfilExtendido(perfilId);
    if (!perfil) return 0;

    const empleos = await this.repo.findAllEmpleosActivos();
    const postulados = this.repo.listEmpleoIdsPostulados(perfilId);
    const scores = this.repo.buildScoresFromEmpleos(perfil, empleos, postulados);
    this.repo.replaceScores(perfilId, scores);
    return scores.length;
  }

  async recalcularTodos(): Promise<number> {
    const ids = this.repo.listPerfilIds();
    for (const id of ids) {
      await this.recalcularParaPerfil(id);
    }
    return ids.length;
  }

  async list(auth: AuthUser, query: RecomendacionesQuery) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.repo.getPerfilExtendido(perfilId);

    if (!perfil || perfil.skills.length === 0) {
      return { recomendaciones: [], perfilIncompleto: true };
    }

    if (this.repo.countByPerfil(perfilId) === 0) {
      await this.recalcularParaPerfil(perfilId);
    }

    const postulados = this.repo.listEmpleoIdsPostulados(perfilId);
    const recomendaciones = this.repo.findByPerfil(perfilId, query, postulados);

    return {
      recomendaciones,
      total: recomendaciones.length,
      perfilIncompleto: false,
    };
  }

  async recalcular(auth: AuthUser) {
    const perfilId = this.requirePerfilId(auth);
    const recalculadas = await this.recalcularParaPerfil(perfilId);
    return {
      recalculadas,
      mensaje: `Se recalcularon ${recalculadas} coincidencias para tu perfil.`,
    };
  }

  async coincidencia(auth: AuthUser, empleoIdRaw: string) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.repo.getPerfilExtendido(perfilId);
    if (!perfil) {
      throw new AppError(404, "Perfil no encontrado");
    }

    const empleoId = parseId(empleoIdRaw);
    const row = this.repo.findEmpleoActivoById(empleoId);
    if (!row) {
      throw new AppError(404, "Oferta no disponible o cerrada");
    }

    const pesos = normalizarPesos(this.motorConfig.getPesos());
    const postulados = this.repo.listEmpleoIdsPostulados(perfilId);
    const resultado = calcularRecomendacion(
      perfil,
      {
        title: row.titulo,
        descripcion: row.descripcion ?? undefined,
        modalidad: row.modalidad ?? undefined,
        ubicacion: row.ubicacion ?? undefined,
        categoria: row.categoria ?? undefined,
        tipoOportunidad: row.tipo_oportunidad ?? undefined,
        habilidadesRequeridas: row.habilidades_requeridas
          ? row.habilidades_requeridas.split(",").map((s) => s.trim())
          : [],
        fechaPublicacion: row.fecha_publicacion ?? undefined,
      },
      pesos,
    );

    let puntaje = resultado.puntaje;
    const yaPostulado = postulados.has(empleoId);
    if (yaPostulado) {
      puntaje = Math.max(0, puntaje - 15);
    }

    return {
      empleoId: String(empleoId),
      puntaje,
      nivel: interpretarNivel(puntaje),
      motivo: resultado.motivo,
      razones: resultado.razones,
      desglose: resultado.desglose,
      yaPostulado,
    };
  }

  getPreferencias(auth: AuthUser) {
    const perfilId = this.requirePerfilId(auth);
    const prefs = this.repo.getPreferencias(perfilId);
    if (!prefs) throw new AppError(404, "Perfil no encontrado");
    return prefs;
  }

  async updatePreferencias(auth: AuthUser, data: PreferenciasBody) {
    const perfilId = this.requirePerfilId(auth);
    const prefs = this.repo.upsertPreferencias(perfilId, data);
    await this.recalcularParaPerfil(perfilId);
    return prefs;
  }
}

/** Alias legacy para módulos existentes (perfil, soporte) */
export class RecomendacionesService extends RecommendationService {}
