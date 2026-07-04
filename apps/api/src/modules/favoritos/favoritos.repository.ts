import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import type { Empleo } from "../empleos/empleos.schema.js";
import type { Favorito, FavoritoEstadoEmpleo } from "./favoritos.schema.js";

type FavoritoRow = {
  id: number;
  perfil_id: number;
  empleo_id: number;
  creado_en: string;
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

function mapEmpleo(row: FavoritoRow): Empleo {
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

function mapFavorito(row: FavoritoRow): Favorito {
  return {
    id: String(row.id),
    empleoId: String(row.empleo_id),
    creadoEn: row.creado_en,
    empleo: mapEmpleo(row),
  };
}

export class FavoritosRepository {
  findByPerfil(perfilId: number): Favorito[] {
    const rows = getDb()
      .prepare(
        `SELECT fav.id, fav.perfil_id, fav.empleo_id, fav.creado_en,
                ${empleoSelect}
         FROM favorito fav
         INNER JOIN empleo e ON e.id = fav.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE fav.perfil_id = ?
         ORDER BY fav.creado_en DESC, fav.id DESC`,
      )
      .all(perfilId) as FavoritoRow[];
    return rows.map(mapFavorito);
  }

  exists(perfilId: number, empleoId: number): boolean {
    const row = getDb()
      .prepare(
        "SELECT 1 AS ok FROM favorito WHERE perfil_id = ? AND empleo_id = ?",
      )
      .get(perfilId, empleoId) as { ok: 1 } | undefined;
    return row !== undefined;
  }

  getEstadoEmpleo(perfilId: number, empleoId: number): FavoritoEstadoEmpleo {
    return { esFavorito: this.exists(perfilId, empleoId) };
  }

  add(perfilId: number, empleoId: number): Favorito {
    try {
      const result = getDb()
        .prepare("INSERT INTO favorito (perfil_id, empleo_id) VALUES (?, ?)")
        .run(perfilId, empleoId);
      const created = this.findById(Number(result.lastInsertRowid));
      if (!created) {
        throw new AppError(500, "No se pudo guardar el favorito");
      }
      return created;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed")
      ) {
        throw new AppError(409, "Esta oferta ya está en tus favoritos");
      }
      throw err;
    }
  }

  remove(perfilId: number, empleoId: number): void {
    const result = getDb()
      .prepare("DELETE FROM favorito WHERE perfil_id = ? AND empleo_id = ?")
      .run(perfilId, empleoId);
    if (result.changes === 0) {
      throw new AppError(404, "Favorito no encontrado");
    }
  }

  findById(id: number): Favorito | null {
    const row = getDb()
      .prepare(
        `SELECT fav.id, fav.perfil_id, fav.empleo_id, fav.creado_en,
                ${empleoSelect}
         FROM favorito fav
         INNER JOIN empleo e ON e.id = fav.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE fav.id = ?`,
      )
      .get(id) as FavoritoRow | undefined;
    return row ? mapFavorito(row) : null;
  }
}
