import { getDb } from "../../core/db/conexion.js";
import { SQL_OFERTA_PUBLICA, syncOfertasVencidas } from "../ofertas/ensureOffersSchema.js";
import type { Empleo, ListEmpleosQuery, ListEmpleosResult } from "./empleos.schema.js";

type EmpleoRow = {
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
};

const selectColumns = `e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.descripcion, e.url_oferta, e.salario, e.fecha_publicacion, f.nombre AS fuente_nombre`;

const fromJoin = "FROM empleo e LEFT JOIN fuente_empleo f ON f.id = e.fuente_id";

function mapRow(row: EmpleoRow): Empleo {
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

function buildFiltroClauses(
  f: ListEmpleosQuery,
): { whereSql: string; values: (string | number)[] } {
  const conds: string[] = [];
  const values: (string | number)[] = [];
  if (f.q) {
    const t = `%${f.q.toLowerCase()}%`;
    conds.push(
      `(LOWER(e.titulo) LIKE ? OR LOWER(e.empresa) LIKE ? OR (e.descripcion IS NOT NULL AND LOWER(e.descripcion) LIKE ?))`,
    );
    values.push(t, t, t);
  }
  if (f.ubicacion) {
    const t = `%${f.ubicacion.toLowerCase()}%`;
    conds.push(`(e.ubicacion IS NOT NULL AND LOWER(e.ubicacion) LIKE ?)`);
    values.push(t);
  }
  if (f.modalidad) {
    conds.push(`(e.modalidad IS NOT NULL AND LOWER(e.modalidad) = LOWER(?))`);
    values.push(f.modalidad);
  }
  if (f.fuente) {
    const trimmed = f.fuente.trim();
    if (trimmed.length > 0) {
      if (/^\d+$/.test(trimmed)) {
        conds.push(`(e.fuente_id = ?)`);
        values.push(parseInt(trimmed, 10));
      } else {
        const t = `%${trimmed.toLowerCase()}%`;
        conds.push(`(f.nombre IS NOT NULL AND LOWER(f.nombre) LIKE ?)`);
        values.push(t);
      }
    }
  }
  if (f.categoria) {
    conds.push(`(e.categoria = ?)`);
    values.push(f.categoria);
  }
  if (f.tipo) {
    conds.push(`(e.tipo_oportunidad = ?)`);
    values.push(f.tipo);
  }
  syncOfertasVencidas();
  conds.push(`(${SQL_OFERTA_PUBLICA.replace(/\n/g, " ")})`);
  const whereSql = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";
  return { whereSql, values };
}

const sqlByIdPublico = `
  SELECT e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.descripcion, e.url_oferta, e.salario, e.fecha_publicacion, f.nombre AS fuente_nombre
  FROM empleo e
  LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
  WHERE e.id = ? AND (${SQL_OFERTA_PUBLICA.replace(/\n/g, " ")})
`;

export class EmpleosRepository {
  listFiltrado(query: ListEmpleosQuery): Promise<ListEmpleosResult> {
    const { whereSql, values } = buildFiltroClauses(query);
    const base = `${fromJoin} ${whereSql}`;
    const countRow = getDb()
      .prepare(`SELECT COUNT(DISTINCT e.id) AS c ${base}`)
      .get(...values) as { c: number };
    const total = countRow.c;
    const offset = (query.page - 1) * query.limit;
    const rows = getDb()
      .prepare(
        `SELECT ${selectColumns} ${base} ORDER BY e.id LIMIT ? OFFSET ?`,
      )
      .all(...values, query.limit, offset) as EmpleoRow[];
    return Promise.resolve({
      empleos: rows.map(mapRow),
      page: query.page,
      limit: query.limit,
      total,
    });
  }

  findAll(): Promise<Empleo[]> {
    syncOfertasVencidas();
    const sql = `SELECT ${selectColumns} ${fromJoin} WHERE ${SQL_OFERTA_PUBLICA.replace(/\n/g, " ")} ORDER BY e.id`;
    const rows = getDb().prepare(sql).all() as EmpleoRow[];
    return Promise.resolve(rows.map(mapRow));
  }

  findById(id: string): Promise<Empleo | null> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return Promise.resolve(null);
    }
    syncOfertasVencidas();
    const row = getDb().prepare(sqlByIdPublico).get(numericId) as EmpleoRow | undefined;
    return Promise.resolve(row === undefined ? null : mapRow(row));
  }
}
