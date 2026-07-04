import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import type {
  CreateEmpleoAdminBody,
  EmpleoAdmin,
  OfertasPorFuente,
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

  getReportesResumen(): ReportesResumen {
    ensureAdminSchema();
    const db = getDb();

    const usuariosActivos = (
      db.prepare("SELECT COUNT(*) AS c FROM usuario WHERE activo = 1").get() as {
        c: number;
      }
    ).c;

    const ofertasPublicadas = (
      db.prepare("SELECT COUNT(*) AS c FROM empleo WHERE activo = 1").get() as {
        c: number;
      }
    ).c;

    const ofertasPorFuente = db
      .prepare(
        `SELECT f.nombre AS fuente, COUNT(*) AS total
         FROM empleo e
         INNER JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE e.activo = 1
         GROUP BY f.id, f.nombre
         ORDER BY total DESC, f.nombre ASC`,
      )
      .all() as OfertasPorFuente[];

    const recomendacionesGeneradas = (
      db.prepare("SELECT COUNT(*) AS c FROM recomendacion").get() as { c: number }
    ).c;

    const postulacionesRegistradas = (
      db.prepare("SELECT COUNT(*) AS c FROM postulacion").get() as { c: number }
    ).c;

    const favoritosGuardados = (
      db.prepare("SELECT COUNT(*) AS c FROM favorito").get() as { c: number }
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
}
