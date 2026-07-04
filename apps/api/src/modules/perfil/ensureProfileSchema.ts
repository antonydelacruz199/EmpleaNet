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

export function ensureProfileSchema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../database/migrations/008_profile_module.sql",
  );
  getDb().exec(fs.readFileSync(migrationPath, "utf8"));

  addColumnIfMissing("perfil", "telefono", "TEXT");
  addColumnIfMissing("perfil", "resumen", "TEXT");
  addColumnIfMissing("perfil", "carrera_id", "INTEGER REFERENCES carrera(id)");
  addColumnIfMissing("perfil", "ciclo_actual", "INTEGER");
  addColumnIfMissing("perfil", "anio_egreso", "INTEGER");
  addColumnIfMissing("perfil", "cv_ruta", "TEXT");
  addColumnIfMissing("perfil", "cv_nombre", "TEXT");
  addColumnIfMissing("perfil", "completitud_pct", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("perfil", "perfil_completo", "INTEGER NOT NULL DEFAULT 0");

  getDb().prepare(
    `UPDATE perfil SET perfil_completo = 1, completitud_pct = 100
     WHERE COALESCE(habilidades, '') != '' AND perfil_completo = 0`,
  ).run();
}
