import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import type { Empleo } from "../empleos/empleos.schema.js";
import type { OportunidadVista } from "./seguimiento.schema.js";

type VistaRow = {
  id: number;
  perfil_id: number;
  empleo_id: number;
  visto_en: string;
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

function mapEmpleo(row: VistaRow): Empleo {
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

function mapVista(row: VistaRow): OportunidadVista {
  return {
    id: String(row.id),
    empleoId: String(row.empleo_id),
    vistoEn: row.visto_en,
    empleo: mapEmpleo(row),
  };
}

export class SeguimientoRepository {
  registerView(perfilId: number, empleoId: number): OportunidadVista {
    const db = getDb();
    const existing = db
      .prepare(
        "SELECT id FROM oportunidad_vista WHERE perfil_id = ? AND empleo_id = ?",
      )
      .get(perfilId, empleoId) as { id: number } | undefined;

    if (existing) {
      db.prepare(
        "UPDATE oportunidad_vista SET visto_en = CURRENT_TIMESTAMP WHERE id = ?",
      ).run(existing.id);
      const updated = this.findById(existing.id);
      if (!updated) {
        throw new AppError(500, "No se pudo actualizar la vista");
      }
      return updated;
    }

    const result = db
      .prepare(
        "INSERT INTO oportunidad_vista (perfil_id, empleo_id) VALUES (?, ?)",
      )
      .run(perfilId, empleoId);
    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new AppError(500, "No se pudo registrar la vista");
    }
    return created;
  }

  findByPerfil(perfilId: number): OportunidadVista[] {
    const rows = getDb()
      .prepare(
        `SELECT v.id, v.perfil_id, v.empleo_id, v.visto_en,
                ${empleoSelect}
         FROM oportunidad_vista v
         INNER JOIN empleo e ON e.id = v.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE v.perfil_id = ?
         ORDER BY v.visto_en DESC, v.id DESC`,
      )
      .all(perfilId) as VistaRow[];
    return rows.map(mapVista);
  }

  countByPerfil(perfilId: number): number {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS c FROM oportunidad_vista WHERE perfil_id = ?")
      .get(perfilId) as { c: number };
    return row.c;
  }

  findById(id: number): OportunidadVista | null {
    const row = getDb()
      .prepare(
        `SELECT v.id, v.perfil_id, v.empleo_id, v.visto_en,
                ${empleoSelect}
         FROM oportunidad_vista v
         INNER JOIN empleo e ON e.id = v.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE v.id = ?`,
      )
      .get(id) as VistaRow | undefined;
    return row ? mapVista(row) : null;
  }
}
