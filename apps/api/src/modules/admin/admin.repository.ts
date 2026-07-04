import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../../core/db/conexion.js";
import { ensureFase6Schema } from "../../core/auditoria/auditoria.repository.js";
import { SQL_OFERTA_PUBLICA, syncOfertasVencidas } from "../ofertas/ensureOffersSchema.js";
import { AppError } from "../../core/errors/AppError.js";
import type {
  CreateEmpleoAdminBody,
  EmpleoAdmin,
  EstrategicoResumen,
  IncidenciaResumen,
  ListReporteResult,
  OfertasPorFuente,
  ReporteOfertaItem,
  ReportePostulacionItem,
  ReporteRecomendacionItem,
  ReporteUsuarioItem,
  ReportesFiltros,
  ReportesKpis,
  ReportesResumen,
  UpdateEmpleoAdminBody,
} from "./admin.schema.js";

type EmpleoAdminRow = {
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  modalidad: string | null;
  descripcion: string | null;
  url_oferta: string | null;
  salario: string | null;
  fecha_publicacion: string | null;
  fuente_nombre: string | null;
  activo: number;
  creado_en: string;
};

function appendDateFilter(
  column: string,
  filtros: ReportesFiltros,
  conditions: string[],
  values: (string | number)[],
): void {
  if (filtros.fechaDesde) {
    conditions.push(`date(${column}) >= date(?)`);
    values.push(filtros.fechaDesde);
  }
  if (filtros.fechaHasta) {
    conditions.push(`date(${column}) <= date(?)`);
    values.push(filtros.fechaHasta);
  }
}

function buildWhere(
  conditions: string[],
  values: (string | number)[],
): { sql: string; params: (string | number)[] } {
  if (conditions.length === 0) {
    return { sql: "", params: values };
  }
  return { sql: `WHERE ${conditions.join(" AND ")}`, params: values };
}

function buildMejorasSugeridas(data: {
  incidenciasAbiertas: number;
  tasaPostulacionPorOferta: number;
  ofertasPublicadas: number;
  tasaPerfilCompleto: number;
  usuariosActivos: number;
}): string[] {
  const sugerencias: string[] = [];
  if (data.incidenciasAbiertas > 0) {
    sugerencias.push(
      `Atender ${data.incidenciasAbiertas} incidencia(s) técnica(s) pendiente(s) en soporte.`,
    );
  }
  if (data.ofertasPublicadas > 0 && data.tasaPostulacionPorOferta < 0.5) {
    sugerencias.push(
      "Revisar visibilidad de ofertas: baja tasa de postulación por oferta activa.",
    );
  }
  if (data.usuariosActivos > 0 && data.tasaPerfilCompleto < 50) {
    sugerencias.push(
      "Impulsar completitud de perfiles: menos del 50% de usuarios activos tienen perfil completo.",
    );
  }
  if (sugerencias.length === 0) {
    sugerencias.push("Indicadores dentro de rangos esperados; mantener monitoreo periódico.");
  }
  return sugerencias;
}

const FUENTE_INSTITUCIONAL = "Institucional";

const selectColumns = `e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.descripcion,
  e.url_oferta, e.salario, e.fecha_publicacion, f.nombre AS fuente_nombre, e.activo, e.creado_en`;

const fromJoin = `FROM empleo e LEFT JOIN fuente_empleo f ON f.id = e.fuente_id`;

function mapRow(row: EmpleoAdminRow): EmpleoAdmin {
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
    activo: row.activo === 1,
    creadoEn: row.creado_en,
  };
}

export function ensureAdminSchema(): void {
  const db = getDb();
  const cols = db.pragma("table_info(empleo)") as { name: string }[];
  if (!cols.some((c) => c.name === "activo")) {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const migrationPath = path.resolve(
      dirname,
      "../../../../../database/migrations/005_admin_empleo_activo.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");
    db.exec(sql);
  } else {
    db.exec(`
      INSERT OR IGNORE INTO fuente_empleo (nombre, tipo, url, activa)
      SELECT '${FUENTE_INSTITUCIONAL}', 'manual', NULL, 1
      WHERE NOT EXISTS (SELECT 1 FROM fuente_empleo WHERE nombre = '${FUENTE_INSTITUCIONAL}')
    `);
  }
  db.exec("CREATE INDEX IF NOT EXISTS idx_empleo_activo ON empleo(activo)");
}

export class AdminRepository {
  private getInstitutionalSourceId(): number {
    ensureAdminSchema();
    const row = getDb()
      .prepare("SELECT id FROM fuente_empleo WHERE nombre = ?")
      .get(FUENTE_INSTITUCIONAL) as { id: number } | undefined;
    if (!row) {
      throw new AppError(500, "Fuente institucional no configurada");
    }
    return row.id;
  }

  listEmpleos(): EmpleoAdmin[] {
    ensureAdminSchema();
    const rows = getDb()
      .prepare(
        `SELECT ${selectColumns} ${fromJoin} ORDER BY e.activo DESC, e.id DESC`,
      )
      .all() as EmpleoAdminRow[];
    return rows.map(mapRow);
  }

  findEmpleoById(id: number): EmpleoAdmin | null {
    ensureAdminSchema();
    const row = getDb()
      .prepare(`SELECT ${selectColumns} ${fromJoin} WHERE e.id = ?`)
      .get(id) as EmpleoAdminRow | undefined;
    return row ? mapRow(row) : null;
  }

  createManual(data: CreateEmpleoAdminBody): EmpleoAdmin {
    const fuenteId = this.getInstitutionalSourceId();
    const result = getDb()
      .prepare(
        `INSERT INTO empleo (fuente_id, titulo, empresa, ubicacion, modalidad, descripcion, url_oferta, salario, fecha_publicacion, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      )
      .run(
        fuenteId,
        data.title,
        data.company,
        data.location ?? null,
        data.modalidad ?? null,
        data.descripcion ?? null,
        data.urlOferta ?? null,
        data.salario ?? null,
        data.fechaPublicacion ?? null,
      );
    const created = this.findEmpleoById(Number(result.lastInsertRowid));
    if (!created) {
      throw new AppError(500, "No se pudo crear la oferta");
    }
    return created;
  }

  updateEmpleo(id: number, data: UpdateEmpleoAdminBody): EmpleoAdmin {
    const existing = this.findEmpleoById(id);
    if (!existing) {
      throw new AppError(404, "Oferta no encontrada");
    }

    getDb()
      .prepare(
        `UPDATE empleo SET
          titulo = COALESCE(?, titulo),
          empresa = COALESCE(?, empresa),
          ubicacion = COALESCE(?, ubicacion),
          modalidad = COALESCE(?, modalidad),
          descripcion = COALESCE(?, descripcion),
          url_oferta = COALESCE(?, url_oferta),
          salario = COALESCE(?, salario),
          fecha_publicacion = COALESCE(?, fecha_publicacion)
         WHERE id = ?`,
      )
      .run(
        data.title ?? null,
        data.company ?? null,
        data.location ?? null,
        data.modalidad ?? null,
        data.descripcion ?? null,
        data.urlOferta ?? null,
        data.salario ?? null,
        data.fechaPublicacion ?? null,
        id,
      );

    return this.findEmpleoById(id)!;
  }

  setActivo(id: number, activo: boolean): EmpleoAdmin {
    const existing = this.findEmpleoById(id);
    if (!existing) {
      throw new AppError(404, "Oferta no encontrada");
    }
    getDb()
      .prepare("UPDATE empleo SET activo = ? WHERE id = ?")
      .run(activo ? 1 : 0, id);
    return this.findEmpleoById(id)!;
  }

  getReportesResumen(filtros: ReportesFiltros = {}): ReportesResumen {
    ensureAdminSchema();
    const db = getDb();

    const userConds = ["u.activo = 1"];
    const userVals: (string | number)[] = [];
    if (filtros.rol) {
      userConds.push("u.rol = ?");
      userVals.push(filtros.rol);
    }
    appendDateFilter("u.creado_en", filtros, userConds, userVals);
    const userWhere = buildWhere(userConds, userVals);
    const usuariosActivos = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM usuario u ${userWhere.sql}`)
        .get(...userWhere.params) as { c: number }
    ).c;

    syncOfertasVencidas();
    const ofertaConds = [SQL_OFERTA_PUBLICA.replace(/\n/g, " ")];
    const ofertaVals: (string | number)[] = [];
    appendDateFilter("e.creado_en", filtros, ofertaConds, ofertaVals);
    if (filtros.estado) {
      ofertaConds.push("e.estado = ?");
      ofertaVals.push(filtros.estado);
    }
    const ofertaWhere = buildWhere(ofertaConds, ofertaVals);
    const ofertasPublicadas = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM empleo e ${ofertaWhere.sql}`)
        .get(...ofertaWhere.params) as { c: number }
    ).c;

    const fuenteConds = [...ofertaConds];
    const fuenteVals = [...ofertaVals];
    const fuenteWhere = buildWhere(fuenteConds, fuenteVals);
    const ofertasPorFuente = db
      .prepare(
        `SELECT f.nombre AS fuente, COUNT(*) AS total
         FROM empleo e
         INNER JOIN fuente_empleo f ON f.id = e.fuente_id
         ${fuenteWhere.sql}
         GROUP BY f.id, f.nombre
         ORDER BY total DESC, f.nombre ASC`,
      )
      .all(...fuenteWhere.params) as OfertasPorFuente[];

    const recConds: string[] = [];
    const recVals: (string | number)[] = [];
    appendDateFilter("r.creado_en", filtros, recConds, recVals);
    const recWhere = buildWhere(recConds, recVals);
    const recomendacionesGeneradas = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM recomendacion r ${recWhere.sql}`)
        .get(...recWhere.params) as { c: number }
    ).c;

    const postConds: string[] = [];
    const postVals: (string | number)[] = [];
    appendDateFilter("p.fecha_postulacion", filtros, postConds, postVals);
    if (filtros.estado) {
      postConds.push("p.estado = ?");
      postVals.push(filtros.estado);
    }
    const postWhere = buildWhere(postConds, postVals);
    const postulacionesRegistradas = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM postulacion p ${postWhere.sql}`)
        .get(...postWhere.params) as { c: number }
    ).c;

    const favConds: string[] = [];
    const favVals: (string | number)[] = [];
    appendDateFilter("fav.creado_en", filtros, favConds, favVals);
    const favWhere = buildWhere(favConds, favVals);
    const favoritosGuardados = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM favorito fav ${favWhere.sql}`)
        .get(...favWhere.params) as { c: number }
    ).c;

    return {
      usuariosActivos,
      ofertasPublicadas,
      ofertasPorFuente,
      recomendacionesGeneradas,
      postulacionesRegistradas,
      favoritosGuardados,
    };
  }

  getReportesKpis(filtros: ReportesFiltros = {}): ReportesKpis {
    const base = this.getReportesResumen(filtros);
    const db = getDb();

    const postActivas = (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM postulacion WHERE estado IN ('registrada', 'en_proceso')`,
        )
        .get() as { c: number }
    ).c;

    const perfilesCompletos = (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM perfil p
           INNER JOIN usuario u ON u.id = p.usuario_id
           WHERE p.perfil_completo = 1 AND u.activo = 1`,
        )
        .get() as { c: number }
    ).c;

    const tasaPerfilCompleto =
      base.usuariosActivos > 0
        ? Math.round((perfilesCompletos / base.usuariosActivos) * 1000) / 10
        : 0;

    const promedioRow = db
      .prepare("SELECT AVG(puntaje) AS avg FROM recomendacion")
      .get() as { avg: number | null };

    const tasaPostulacionPorOferta =
      base.ofertasPublicadas > 0
        ? Math.round((base.postulacionesRegistradas / base.ofertasPublicadas) * 100) / 100
        : 0;

    return {
      ...base,
      postulacionesActivas: postActivas,
      perfilesCompletos,
      tasaPerfilCompleto,
      tasaPostulacionPorOferta,
      recomendacionPuntajePromedio: Math.round((promedioRow.avg ?? 0) * 10) / 10,
    };
  }

  getReporteUsuarios(filtros: ReportesFiltros = {}): ListReporteResult<ReporteUsuarioItem> {
    ensureAdminSchema();
    const db = getDb();
    const conds: string[] = [];
    const vals: (string | number)[] = [];
    if (filtros.rol) {
      conds.push("u.rol = ?");
      vals.push(filtros.rol);
    }
    if (filtros.estado === "activo") {
      conds.push("u.activo = 1");
    } else if (filtros.estado === "inactivo") {
      conds.push("u.activo = 0");
    }
    appendDateFilter("u.creado_en", filtros, conds, vals);
    const where = buildWhere(conds, vals);

    const total = (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM usuario u
           LEFT JOIN perfil p ON p.usuario_id = u.id ${where.sql}`,
        )
        .get(...where.params) as { c: number }
    ).c;

    const rows = db
      .prepare(
        `SELECT u.id, u.email, u.rol, u.activo, u.creado_en,
                COALESCE(p.perfil_completo, 0) AS perfil_completo,
                COALESCE(p.completitud_pct, 0) AS completitud_pct
         FROM usuario u
         LEFT JOIN perfil p ON p.usuario_id = u.id
         ${where.sql}
         ORDER BY u.creado_en DESC, u.id DESC
         LIMIT 100`,
      )
      .all(...where.params) as {
      id: number;
      email: string;
      rol: string;
      activo: number;
      creado_en: string;
      perfil_completo: number;
      completitud_pct: number;
    }[];

    return {
      total,
      items: rows.map((r) => ({
        id: String(r.id),
        email: r.email,
        rol: r.rol,
        activo: r.activo === 1,
        creadoEn: r.creado_en,
        perfilCompleto: r.perfil_completo === 1,
        completitudPct: r.completitud_pct,
      })),
    };
  }

  getReporteOfertas(filtros: ReportesFiltros = {}): ListReporteResult<ReporteOfertaItem> {
    ensureAdminSchema();
    const db = getDb();
    const conds: string[] = [];
    const vals: (string | number)[] = [];
    if (filtros.estado) {
      conds.push("e.estado = ?");
      vals.push(filtros.estado);
    }
    appendDateFilter("e.creado_en", filtros, conds, vals);
    const where = buildWhere(conds, vals);

    const total = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM empleo e ${where.sql}`)
        .get(...where.params) as { c: number }
    ).c;

    const rows = db
      .prepare(
        `SELECT e.id, e.titulo, e.empresa, e.estado, e.modalidad, e.creado_en, f.nombre AS fuente_nombre
         FROM empleo e
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         ${where.sql}
         ORDER BY e.creado_en DESC, e.id DESC
         LIMIT 100`,
      )
      .all(...where.params) as {
      id: number;
      titulo: string;
      empresa: string;
      estado: string;
      modalidad: string | null;
      creado_en: string;
      fuente_nombre: string | null;
    }[];

    return {
      total,
      items: rows.map((r) => ({
        id: String(r.id),
        title: r.titulo,
        company: r.empresa,
        estado: r.estado,
        modalidad: r.modalidad ?? undefined,
        fuenteNombre: r.fuente_nombre ?? undefined,
        creadoEn: r.creado_en,
      })),
    };
  }

  getReporteRecomendaciones(
    filtros: ReportesFiltros = {},
  ): ListReporteResult<ReporteRecomendacionItem> {
    ensureAdminSchema();
    const db = getDb();
    const conds: string[] = [];
    const vals: (string | number)[] = [];
    appendDateFilter("r.creado_en", filtros, conds, vals);
    const where = buildWhere(conds, vals);

    const total = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM recomendacion r ${where.sql}`)
        .get(...where.params) as { c: number }
    ).c;

    const rows = db
      .prepare(
        `SELECT r.id, r.puntaje, r.creado_en, p.email AS perfil_email, e.titulo AS empleo_titulo
         FROM recomendacion r
         INNER JOIN perfil pf ON pf.id = r.perfil_id
         INNER JOIN usuario p ON p.id = pf.usuario_id
         INNER JOIN empleo e ON e.id = r.empleo_id
         ${where.sql}
         ORDER BY r.creado_en DESC, r.id DESC
         LIMIT 100`,
      )
      .all(...where.params) as {
      id: number;
      puntaje: number;
      creado_en: string;
      perfil_email: string;
      empleo_titulo: string;
    }[];

    return {
      total,
      items: rows.map((r) => ({
        id: String(r.id),
        perfilEmail: r.perfil_email,
        empleoTitulo: r.empleo_titulo,
        puntaje: r.puntaje,
        creadoEn: r.creado_en,
      })),
    };
  }

  getReportePostulaciones(
    filtros: ReportesFiltros = {},
  ): ListReporteResult<ReportePostulacionItem> {
    ensureAdminSchema();
    const db = getDb();
    const conds: string[] = [];
    const vals: (string | number)[] = [];
    appendDateFilter("p.fecha_postulacion", filtros, conds, vals);
    if (filtros.estado) {
      conds.push("p.estado = ?");
      vals.push(filtros.estado);
    }
    const where = buildWhere(conds, vals);

    const total = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM postulacion p ${where.sql}`)
        .get(...where.params) as { c: number }
    ).c;

    const rows = db
      .prepare(
        `SELECT p.id, p.estado, p.fecha_postulacion, u.email AS perfil_email, e.titulo AS empleo_titulo
         FROM postulacion p
         INNER JOIN perfil pf ON pf.id = p.perfil_id
         INNER JOIN usuario u ON u.id = pf.usuario_id
         INNER JOIN empleo e ON e.id = p.empleo_id
         ${where.sql}
         ORDER BY p.fecha_postulacion DESC, p.id DESC
         LIMIT 100`,
      )
      .all(...where.params) as {
      id: number;
      estado: string;
      fecha_postulacion: string;
      perfil_email: string;
      empleo_titulo: string;
    }[];

    return {
      total,
      items: rows.map((r) => ({
        id: String(r.id),
        perfilEmail: r.perfil_email,
        empleoTitulo: r.empleo_titulo,
        estado: r.estado,
        fechaPostulacion: r.fecha_postulacion,
      })),
    };
  }

  getEstrategicoResumen(filtros: ReportesFiltros = {}): EstrategicoResumen {
    ensureAdminSchema();
    ensureFase6Schema();
    const base = this.getReportesResumen(filtros);
    const kpis = this.getReportesKpis(filtros);
    const db = getDb();

    const usuariosPorRol = db
      .prepare(
        `SELECT rol AS etiqueta, COUNT(*) AS total FROM usuario WHERE activo = 1 GROUP BY rol ORDER BY total DESC`,
      )
      .all() as { etiqueta: string; total: number }[];

    const postulacionesPorEstado = db
      .prepare(
        `SELECT estado AS etiqueta, COUNT(*) AS total FROM postulacion GROUP BY estado ORDER BY total DESC`,
      )
      .all() as { etiqueta: string; total: number }[];

    const empleosPorModalidad = db
      .prepare(
        `SELECT COALESCE(modalidad, 'sin_definir') AS etiqueta, COUNT(*) AS total
         FROM empleo WHERE activo = 1 GROUP BY modalidad ORDER BY total DESC`,
      )
      .all() as { etiqueta: string; total: number }[];

    const incidenciasAbiertas = (
      db
        .prepare(
          "SELECT COUNT(*) AS c FROM incidencia WHERE estado IN ('abierta', 'en_proceso')",
        )
        .get() as { c: number }
    ).c;

    const incidenciasRecientes = db
      .prepare(
        `SELECT id, titulo, estado, creado_en FROM incidencia
         WHERE estado IN ('abierta', 'en_proceso')
         ORDER BY creado_en DESC LIMIT 5`,
      )
      .all() as { id: number; titulo: string; estado: string; creado_en: string }[];

    const tasaPostulacionPorOferta = kpis.tasaPostulacionPorOferta;

    const mejorasSugeridas = buildMejorasSugeridas({
      incidenciasAbiertas,
      tasaPostulacionPorOferta,
      ofertasPublicadas: base.ofertasPublicadas,
      tasaPerfilCompleto: kpis.tasaPerfilCompleto,
      usuariosActivos: base.usuariosActivos,
    });

    return {
      ...base,
      usuariosPorRol,
      postulacionesPorEstado,
      empleosPorModalidad,
      recomendacionPuntajePromedio: kpis.recomendacionPuntajePromedio,
      tasaPostulacionPorOferta,
      incidenciasAbiertas,
      incidenciasRecientes: incidenciasRecientes.map(
        (i): IncidenciaResumen => ({
          id: String(i.id),
          titulo: i.titulo,
          estado: i.estado,
          creadoEn: i.creado_en,
        }),
      ),
      mejorasSugeridas,
    };
  }
}
