import { getDb } from "../../core/db/conexion.js";
import type { Empleo } from "./empleos.schema.js";

type EmpleoRow = {
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  descripcion: string | null;
  url_oferta: string | null;
  salario: string | null;
  fecha_publicacion: string | null;
};

function mapRow(row: EmpleoRow): Empleo {
  return {
    id: String(row.id),
    title: row.titulo,
    company: row.empresa,
    location: row.ubicacion ?? undefined,
    descripcion: row.descripcion ?? undefined,
    urlOferta: row.url_oferta ?? undefined,
    salario: row.salario ?? undefined,
    fechaPublicacion: row.fecha_publicacion ?? undefined,
  };
}

const sqlList = `
  SELECT id, titulo, empresa, ubicacion, descripcion, url_oferta, salario, fecha_publicacion
  FROM empleo
  ORDER BY id
`;

const sqlById = `
  SELECT id, titulo, empresa, ubicacion, descripcion, url_oferta, salario, fecha_publicacion
  FROM empleo
  WHERE id = ?
`;

export class EmpleosRepository {
  findAll(): Promise<Empleo[]> {
    const rows = getDb().prepare(sqlList).all() as EmpleoRow[];
    return Promise.resolve(rows.map(mapRow));
  }

  findById(id: string): Promise<Empleo | null> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return Promise.resolve(null);
    }
    const row = getDb().prepare(sqlById).get(numericId) as EmpleoRow | undefined;
    return Promise.resolve(row === undefined ? null : mapRow(row));
  }
}
