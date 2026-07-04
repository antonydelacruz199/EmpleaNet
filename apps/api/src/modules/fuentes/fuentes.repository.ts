import { getDb } from "../../core/db/conexion.js";
import type { Fuente } from "./fuentes.schema.js";

type FuenteRow = {
  id: number;
  nombre: string;
  tipo: string;
  activa: number;
};

function mapRow(row: FuenteRow): Fuente {
  return {
    id: String(row.id),
    name: row.nombre,
    enabled: row.activa === 1,
    type: row.tipo as Fuente["type"],
  };
}

export class FuentesRepository {
  listAll(): Promise<Fuente[]> {
    const rows = getDb()
      .prepare(
        "SELECT id, nombre, tipo, activa FROM fuente_empleo ORDER BY nombre",
      )
      .all() as FuenteRow[];
    return Promise.resolve(rows.map(mapRow));
  }
}
