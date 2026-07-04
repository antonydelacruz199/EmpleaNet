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

export function ensureRecommendationSchema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../database/migrations/010_recommendation_engine.sql",
  );
  getDb().exec(fs.readFileSync(migrationPath, "utf8"));

  addColumnIfMissing("perfil", "carrera", "TEXT");
  addColumnIfMissing("perfil", "intereses", "TEXT");
  addColumnIfMissing("perfil", "anos_experiencia", "INTEGER DEFAULT 0");

  addColumnIfMissing("recomendacion", "nivel", "TEXT");
  addColumnIfMissing("recomendacion", "desglose", "TEXT");
  addColumnIfMissing("recomendacion", "actualizado_en", "TEXT");

  addColumnIfMissing("motor_config", "intereses", "REAL DEFAULT 15");

  getDb().exec(`
    UPDATE motor_config SET
      habilidades = 35, carrera = 25, intereses = 15,
      modalidad = 10, ubicacion = 10, experiencia = 5,
      actualidad = 0
    WHERE id = 1 AND habilidades = 30 AND carrera = 25;
  `);
}

export type RecommendationSettings = {
  puntajeMinimo: number;
  penalizacionPostulado: number;
  version: string;
};

export function getRecommendationSettings(): RecommendationSettings {
  ensureRecommendationSchema();
  const row = getDb()
    .prepare(
      "SELECT puntaje_minimo, penalizacion_postulado, version FROM recommendation_settings WHERE id = 1",
    )
    .get() as
    | { puntaje_minimo: number; penalizacion_postulado: number; version: string }
    | undefined;
  return {
    puntajeMinimo: row?.puntaje_minimo ?? 40,
    penalizacionPostulado: row?.penalizacion_postulado ?? 15,
    version: row?.version ?? "1.0",
  };
}
