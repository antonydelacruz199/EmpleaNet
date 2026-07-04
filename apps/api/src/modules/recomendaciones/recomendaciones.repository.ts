import { getDb } from "../../core/db/conexion.js";
import type { Empleo } from "../empleos/empleos.schema.js";
import { EmpleosRepository } from "../empleos/empleos.repository.js";
import { MotorConfigRepository } from "../soporte/motor-config.repository.js";
import {
  ensureRecommendationSchema,
  getRecommendationSettings,
} from "./ensureRecommendationSchema.js";
import {
  calcularRecomendacion,
  interpretarNivel,
  normalizarPesos,
  type EntradaEmpleoMotor,
  type EntradaPerfilMotor,
} from "./recommendation.engine.js";
import type {
  PreferenciasBody,
  PreferenciasResponse,
  RecomendacionItem,
  RecomendacionesQuery,
} from "./recomendaciones.schema.js";

type RecomendacionRow = {
  puntaje: number;
  motivo: string | null;
  nivel: string | null;
  desglose: string | null;
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  modalidad: string | null;
  categoria: string | null;
  tipo_oportunidad: string | null;
  descripcion: string | null;
  url_oferta: string | null;
  salario: string | null;
  fecha_publicacion: string | null;
  habilidades_requeridas: string | null;
  fuente_nombre: string | null;
};

type PerfilExtendidoRow = {
  id: number;
  nombre: string;
  email: string;
  ubicacion: string | null;
  habilidades: string;
  carrera: string | null;
  intereses: string | null;
  anos_experiencia: number | null;
  modalidad_preferida: string | null;
  ubicacion_preferida: string | null;
  categorias_interes: string | null;
};

function parseCsv(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function mapEmpleo(row: RecomendacionRow): Empleo {
  return {
    id: String(row.id),
    title: row.titulo,
    company: row.empresa,
    location: row.ubicacion ?? undefined,
    modalidad: row.modalidad ?? undefined,
    descripcion: row.descripcion ?? undefined,
    urlOferta: row.url_oferta ?? undefined,
    salario: row.salario ?? undefined,
    fechaPublicacion: row.fecha_publicacion ?? undefined,
    fuenteNombre: row.fuente_nombre ?? undefined,
  };
}

function mapPerfilMotor(row: PerfilExtendidoRow): EntradaPerfilMotor {
  return {
    skills: parseCsv(row.habilidades),
    carrera: row.carrera ?? undefined,
    intereses: parseCsv(row.intereses),
    location: row.ubicacion ?? undefined,
    modalidadPreferida: row.modalidad_preferida ?? undefined,
    ubicacionPreferida: row.ubicacion_preferida ?? undefined,
    anosExperiencia: row.anos_experiencia ?? 0,
    categoriasInteres: parseCsv(row.categorias_interes),
  };
}

function mapEmpleoMotor(row: RecomendacionRow): EntradaEmpleoMotor {
  return {
    title: row.titulo,
    descripcion: row.descripcion ?? undefined,
    modalidad: row.modalidad ?? undefined,
    ubicacion: row.ubicacion ?? undefined,
    categoria: row.categoria ?? undefined,
    tipoOportunidad: row.tipo_oportunidad ?? undefined,
    habilidadesRequeridas: parseCsv(row.habilidades_requeridas),
    fechaPublicacion: row.fecha_publicacion ?? undefined,
  };
}

const selectCols = `r.puntaje, r.motivo, r.nivel, r.desglose,
  e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.categoria,
  e.tipo_oportunidad, e.descripcion, e.url_oferta, e.salario,
  e.fecha_publicacion, e.habilidades_requeridas, f.nombre AS fuente_nombre`;

export class RecomendacionesRepository {
  private readonly empleosRepository = new EmpleosRepository();
  private readonly motorConfigRepository = new MotorConfigRepository();

  init(): void {
    ensureRecommendationSchema();
  }

  getPerfilExtendido(perfilId: number): EntradaPerfilMotor | null {
    this.init();
    const row = getDb()
      .prepare(
        `SELECT p.id, p.nombre, p.email, p.ubicacion, p.habilidades,
                p.carrera, p.intereses, p.anos_experiencia,
                pl.modalidad_preferida, pl.ubicacion_preferida, pl.categorias_interes
         FROM perfil p
         LEFT JOIN preferencia_laboral pl ON pl.perfil_id = p.id
         WHERE p.id = ?`,
      )
      .get(perfilId) as PerfilExtendidoRow | undefined;
    return row ? mapPerfilMotor(row) : null;
  }

  getPreferencias(perfilId: number): PreferenciasResponse | null {
    this.init();
    const row = getDb()
      .prepare(
        `SELECT p.ubicacion, p.habilidades, p.carrera, p.intereses, p.anos_experiencia,
                pl.modalidad_preferida, pl.ubicacion_preferida, pl.categorias_interes
         FROM perfil p
         LEFT JOIN preferencia_laboral pl ON pl.perfil_id = p.id
         WHERE p.id = ?`,
      )
      .get(perfilId) as PerfilExtendidoRow | undefined;
    if (!row) return null;
    return {
      skills: parseCsv(row.habilidades),
      location: row.ubicacion ?? undefined,
      carrera: row.carrera ?? undefined,
      intereses: parseCsv(row.intereses),
      anosExperiencia: row.anos_experiencia ?? 0,
      modalidadPreferida: (row.modalidad_preferida as PreferenciasResponse["modalidadPreferida"]) ?? undefined,
      ubicacionPreferida: row.ubicacion_preferida ?? undefined,
      categoriasInteres: parseCsv(row.categorias_interes) as PreferenciasResponse["categoriasInteres"],
    };
  }

  upsertPreferencias(perfilId: number, data: PreferenciasBody): PreferenciasResponse {
    this.init();
    const db = getDb();
    db.prepare(
      `UPDATE perfil SET
        carrera = COALESCE(?, carrera),
        intereses = COALESCE(?, intereses),
        anos_experiencia = COALESCE(?, anos_experiencia)
       WHERE id = ?`,
    ).run(
      data.carrera ?? null,
      data.intereses ? data.intereses.join(",") : null,
      data.anosExperiencia ?? null,
      perfilId,
    );

    const existe = db
      .prepare("SELECT perfil_id FROM preferencia_laboral WHERE perfil_id = ?")
      .get(perfilId);
    if (existe) {
      db.prepare(
        `UPDATE preferencia_laboral SET
          modalidad_preferida = COALESCE(?, modalidad_preferida),
          ubicacion_preferida = COALESCE(?, ubicacion_preferida),
          categorias_interes = COALESCE(?, categorias_interes),
          actualizado_en = CURRENT_TIMESTAMP
         WHERE perfil_id = ?`,
      ).run(
        data.modalidadPreferida ?? null,
        data.ubicacionPreferida ?? null,
        data.categoriasInteres ? data.categoriasInteres.join(",") : null,
        perfilId,
      );
    } else {
      db.prepare(
        `INSERT INTO preferencia_laboral
         (perfil_id, modalidad_preferida, ubicacion_preferida, categorias_interes)
         VALUES (?, ?, ?, ?)`,
      ).run(
        perfilId,
        data.modalidadPreferida ?? null,
        data.ubicacionPreferida ?? null,
        data.categoriasInteres ? data.categoriasInteres.join(",") : null,
      );
    }
    return this.getPreferencias(perfilId)!;
  }

  listEmpleoIdsPostulados(perfilId: number): Set<number> {
    this.init();
    const rows = getDb()
      .prepare("SELECT empleo_id FROM postulacion WHERE perfil_id = ?")
      .all(perfilId) as { empleo_id: number }[];
    return new Set(rows.map((r) => r.empleo_id));
  }

  async findAllEmpleosActivos() {
    return this.empleosRepository.findAll();
  }

  findEmpleoActivoById(empleoId: number): RecomendacionRow | null {
    this.init();
    const row = getDb()
      .prepare(
        `SELECT NULL AS puntaje, NULL AS motivo, NULL AS nivel, NULL AS desglose,
                e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.categoria,
                e.tipo_oportunidad, e.descripcion, e.url_oferta, e.salario,
                e.fecha_publicacion, e.habilidades_requeridas, f.nombre AS fuente_nombre
         FROM empleo e
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE e.id = ? AND e.estado = 'publicada' AND e.activo = 1
           AND (e.fecha_cierre IS NULL OR e.fecha_cierre >= date('now'))`,
      )
      .get(empleoId) as RecomendacionRow | undefined;
    return row ?? null;
  }

  replaceScores(
    perfilId: number,
    items: {
      empleoId: number;
      puntaje: number;
      motivo: string;
      nivel: string;
      desglose: string;
    }[],
  ): void {
    this.init();
    const db = getDb();
    const now = new Date().toISOString();
    const tx = db.transaction(() => {
      db.prepare("DELETE FROM recomendacion WHERE perfil_id = ?").run(perfilId);
      const stmt = db.prepare(
        `INSERT INTO recomendacion
         (perfil_id, empleo_id, puntaje, motivo, nivel, desglose, actualizado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const item of items) {
        stmt.run(
          perfilId,
          item.empleoId,
          item.puntaje,
          item.motivo,
          item.nivel,
          item.desglose,
          now,
        );
      }
    });
    tx();
  }

  findByPerfil(
    perfilId: number,
    query: RecomendacionesQuery,
    postulados: Set<number>,
  ): RecomendacionItem[] {
    this.init();
    const settings = getRecommendationSettings();
    const minScore = query.incluirNoRecomendables
      ? 0
      : settings.puntajeMinimo;

    let sql = `SELECT ${selectCols}
      FROM recomendacion r
      INNER JOIN empleo e ON e.id = r.empleo_id
      LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
      WHERE r.perfil_id = ? AND r.puntaje >= ?
        AND e.estado = 'publicada' AND e.activo = 1
        AND (e.fecha_cierre IS NULL OR e.fecha_cierre >= date('now'))`;
    const params: (string | number)[] = [perfilId, minScore];

    if (query.nivel) {
      sql += " AND r.nivel = ?";
      params.push(query.nivel);
    }

    sql += ` ORDER BY
      CASE WHEN e.id IN (${postulados.size ? [...postulados].join(",") : "-1"}) THEN 1 ELSE 0 END,
      r.puntaje DESC, e.id ASC LIMIT ?`;
    params.push(query.limit);

    const rows = getDb().prepare(sql).all(...params) as RecomendacionRow[];

    return rows.map((row) => {
      const desglose = row.desglose
        ? (JSON.parse(row.desglose) as RecomendacionItem["desglose"])
        : {
            habilidades: 0,
            carrera: 0,
            intereses: 0,
            modalidad: 0,
            ubicacion: 0,
            experiencia: 0,
          };
      const razones = row.motivo
        ? row.motivo.replace(/\.\s*$/, "").split(". ").filter(Boolean)
        : [];
      return {
        puntaje: row.puntaje,
        nivel: (row.nivel ?? interpretarNivel(row.puntaje)) as RecomendacionItem["nivel"],
        motivo: row.motivo ?? "",
        razones,
        desglose,
        yaPostulado: postulados.has(row.id),
        empleo: mapEmpleo(row),
      };
    });
  }

  countByPerfil(perfilId: number): number {
    this.init();
    const row = getDb()
      .prepare("SELECT COUNT(*) AS c FROM recomendacion WHERE perfil_id = ?")
      .get(perfilId) as { c: number };
    return row.c;
  }

  buildScoresFromEmpleos(
    perfil: EntradaPerfilMotor,
    empleos: Empleo[],
    postulados: Set<number>,
  ): {
    empleoId: number;
    puntaje: number;
    motivo: string;
    nivel: string;
    desglose: string;
  }[] {
    this.init();
    const pesos = normalizarPesos(this.motorConfigRepository.getPesos());
    const settings = getRecommendationSettings();

    return empleos.map((empleo) => {
      const rowLike: RecomendacionRow = {
        puntaje: 0,
        motivo: null,
        nivel: null,
        desglose: null,
        id: Number(empleo.id),
        titulo: empleo.title,
        empresa: empleo.company ?? "",
        ubicacion: empleo.location ?? null,
        modalidad: empleo.modalidad ?? null,
        categoria: empleo.categoria ?? null,
        tipo_oportunidad: empleo.tipoOportunidad ?? null,
        descripcion: empleo.descripcion ?? null,
        url_oferta: empleo.urlOferta ?? null,
        salario: empleo.salario ?? null,
        fecha_publicacion: empleo.fechaPublicacion ?? null,
        habilidades_requeridas: null,
        fuente_nombre: empleo.fuenteNombre ?? null,
      };

      const resultado = calcularRecomendacion(
        perfil,
        mapEmpleoMotor(rowLike),
        pesos,
      );

      let puntaje = resultado.puntaje;
      if (postulados.has(Number(empleo.id))) {
        puntaje = Math.max(
          0,
          Math.round((puntaje - settings.penalizacionPostulado) * 10) / 10,
        );
      }

      return {
        empleoId: Number(empleo.id),
        puntaje,
        motivo: resultado.motivo,
        nivel: interpretarNivel(puntaje),
        desglose: JSON.stringify(resultado.desglose),
      };
    });
  }

  listPerfilIds(): number[] {
    this.init();
    const rows = getDb()
      .prepare("SELECT id FROM perfil ORDER BY id")
      .all() as { id: number }[];
    return rows.map((r) => r.id);
  }
}
