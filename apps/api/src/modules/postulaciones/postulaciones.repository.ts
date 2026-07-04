import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import type { Empleo } from "../empleos/empleos.schema.js";
import type {
  EstadoPostulacion,
  Postulacion,
  PostulacionEstadoEmpleo,
} from "./postulaciones.schema.js";

type PostulacionRow = {
  id: number;
  perfil_id: number;
  empleo_id: number;
  estado: EstadoPostulacion;
  fecha_postulacion: string;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  modalidad: string | null;
  descripcion: string | null;
  url_oferta: string | null;
  salario: string | null;
  fecha_publicacion: string | null;
  fuente_nombre: string | null;
};

const empleoSelect = `e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.descripcion,
  e.url_oferta, e.salario, e.fecha_publicacion, f.nombre AS fuente_nombre`;

function mapEmpleo(row: PostulacionRow): Empleo {
  return {
    id: String(row.empleo_id),
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

function mapPostulacion(row: PostulacionRow, includeEmpleo = true): Postulacion {
  return {
    id: String(row.id),
    empleoId: String(row.empleo_id),
    estado: row.estado,
    fechaPostulacion: row.fecha_postulacion,
    ...(includeEmpleo ? { empleo: mapEmpleo(row) } : {}),
  };
}

export function ensurePostulacionFavoritoSchema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../../database/migrations/004_postulacion_favorito.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");
  getDb().exec(sql);
}

export class PostulacionesRepository {
  findByPerfil(perfilId: number): Postulacion[] {
    const rows = getDb()
      .prepare(
        `SELECT p.id, p.perfil_id, p.empleo_id, p.estado, p.fecha_postulacion,
                ${empleoSelect}
         FROM postulacion p
         INNER JOIN empleo e ON e.id = p.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE p.perfil_id = ?
         ORDER BY p.fecha_postulacion DESC, p.id DESC`,
      )
      .all(perfilId) as PostulacionRow[];
    return rows.map((row) => mapPostulacion(row));
  }

  findByPerfilAndEmpleo(perfilId: number, empleoId: number): Postulacion | null {
    const row = getDb()
      .prepare(
        `SELECT p.id, p.perfil_id, p.empleo_id, p.estado, p.fecha_postulacion,
                ${empleoSelect}
         FROM postulacion p
         INNER JOIN empleo e ON e.id = p.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE p.perfil_id = ? AND p.empleo_id = ?`,
      )
      .get(perfilId, empleoId) as PostulacionRow | undefined;
    return row ? mapPostulacion(row) : null;
  }

  getEstadoEmpleo(perfilId: number, empleoId: number): PostulacionEstadoEmpleo {
    const postulacion = this.findByPerfilAndEmpleo(perfilId, empleoId);
    if (!postulacion) {
      return { postulado: false };
    }
    return { postulado: true, postulacion };
  }

  countActivasByPerfil(perfilId: number): number {
    const row = getDb()
      .prepare(
        `SELECT COUNT(*) AS c FROM postulacion
         WHERE perfil_id = ? AND estado IN ('registrada', 'en_proceso')`,
      )
      .get(perfilId) as { c: number };
    return row.c;
  }

  create(perfilId: number, empleoId: number): Postulacion {
    try {
      const result = getDb()
        .prepare(
          `INSERT INTO postulacion (perfil_id, empleo_id, estado)
           VALUES (?, ?, 'registrada')`,
        )
        .run(perfilId, empleoId);
      const created = this.findById(Number(result.lastInsertRowid));
      if (!created) {
        throw new AppError(500, "No se pudo registrar la postulación");
      }
      return created;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed")
      ) {
        throw new AppError(409, "Ya registraste una postulación para esta oferta");
      }
      throw err;
    }
  }

  findById(id: number): Postulacion | null {
    const row = getDb()
      .prepare(
        `SELECT p.id, p.perfil_id, p.empleo_id, p.estado, p.fecha_postulacion,
                ${empleoSelect}
         FROM postulacion p
         INNER JOIN empleo e ON e.id = p.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE p.id = ?`,
      )
      .get(id) as PostulacionRow | undefined;
    return row ? mapPostulacion(row) : null;
  }
}
