import { getDb } from "../../core/db/conexion.js";
import { ensureFase6Schema } from "../../core/auditoria/auditoria.repository.js";
import { AppError } from "../../core/errors/AppError.js";
import type { Incidencia } from "./soporte.schema.js";

type IncidenciaRow = {
  id: number;
  titulo: string;
  descripcion: string | null;
  estado: "abierta" | "en_proceso" | "cerrada";
  creado_en: string;
  nombre: string | null;
};

function mapRow(row: IncidenciaRow): Incidencia {
  return {
    id: String(row.id),
    titulo: row.titulo,
    descripcion: row.descripcion ?? undefined,
    estado: row.estado,
    creadoEn: row.creado_en,
    reportadoPor: row.nombre ?? undefined,
  };
}

export class IncidenciasRepository {
  list(): Incidencia[] {
    ensureFase6Schema();
    const rows = getDb()
      .prepare(
        `SELECT i.id, i.titulo, i.descripcion, i.estado, i.creado_en, u.email AS nombre
         FROM incidencia i
         LEFT JOIN usuario u ON u.id = i.usuario_id
         ORDER BY i.creado_en DESC, i.id DESC`,
      )
      .all() as IncidenciaRow[];
    return rows.map(mapRow);
  }

  create(usuarioId: number, titulo: string, descripcion?: string): Incidencia {
    ensureFase6Schema();
    const result = getDb()
      .prepare(
        `INSERT INTO incidencia (usuario_id, titulo, descripcion, estado)
         VALUES (?, ?, ?, 'abierta')`,
      )
      .run(usuarioId, titulo, descripcion ?? null);
    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new AppError(500, "No se pudo registrar la incidencia");
    }
    return created;
  }

  updateEstado(
    id: number,
    estado: "abierta" | "en_proceso" | "cerrada",
  ): Incidencia {
    ensureFase6Schema();
    const result = getDb()
      .prepare("UPDATE incidencia SET estado = ? WHERE id = ?")
      .run(estado, id);
    if (result.changes === 0) {
      throw new AppError(404, "Incidencia no encontrada");
    }
    return this.findById(id)!;
  }

  findById(id: number): Incidencia | null {
    ensureFase6Schema();
    const row = getDb()
      .prepare(
        `SELECT i.id, i.titulo, i.descripcion, i.estado, i.creado_en, u.email AS nombre
         FROM incidencia i
         LEFT JOIN usuario u ON u.id = i.usuario_id
         WHERE i.id = ?`,
      )
      .get(id) as IncidenciaRow | undefined;
    return row ? mapRow(row) : null;
  }
}
