import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../../core/db/conexion.js";

function addColumnIfMissing(
  table: string,
  column: string,
  definition: string,
): void {
  const db = getDb();
  const cols = db.pragma(`table_info(${table})`) as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function ensureOffersSchema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../database/migrations/009_offers_module.sql",
  );
  getDb().exec(fs.readFileSync(migrationPath, "utf8"));

  addColumnIfMissing("empleo", "estado", "TEXT NOT NULL DEFAULT 'publicada'");
  addColumnIfMissing("empleo", "fecha_cierre", "TEXT");
  addColumnIfMissing("empleo", "categoria", "TEXT");
  addColumnIfMissing("empleo", "tipo_oportunidad", "TEXT");
  addColumnIfMissing("empleo", "empresa_id", "INTEGER REFERENCES empresa(id)");
  addColumnIfMissing("empleo", "motivo_rechazo", "TEXT");
  addColumnIfMissing("empleo", "validado_en", "TEXT");
  addColumnIfMissing("empleo", "publicado_en", "TEXT");
  addColumnIfMissing("empleo", "habilidades_requeridas", "TEXT");

  getDb().exec(`
    CREATE INDEX IF NOT EXISTS idx_empleo_estado ON empleo(estado);
    CREATE INDEX IF NOT EXISTS idx_empleo_fecha_cierre ON empleo(fecha_cierre);
    CREATE INDEX IF NOT EXISTS idx_empleo_categoria ON empleo(categoria);
    UPDATE empleo SET estado = 'publicada' WHERE estado IS NULL OR estado = '';
  `);
}

/** Condición SQL: oferta visible en marketplace público */
export const SQL_OFERTA_PUBLICA = `
  e.estado = 'publicada'
  AND e.activo = 1
  AND (e.fecha_cierre IS NULL OR e.fecha_cierre >= date('now'))
`;

export function syncOfertasVencidas(): number {
  ensureOffersSchema();
  const result = getDb()
    .prepare(
      `UPDATE empleo SET estado = 'cerrada', activo = 0
       WHERE estado = 'publicada' AND activo = 1
       AND fecha_cierre IS NOT NULL AND fecha_cierre < date('now')`,
    )
    .run();
  return result.changes;
}
