import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../config/env.js";
import { ensureAuthSchema } from "../../modules/auth/auth.repository.js";
import { ensurePostulacionFavoritoSchema } from "../../modules/postulaciones/postulaciones.repository.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, "../../../../..");

const SQLITE_URL_PREFIX = "sqlite://";

/**
 * Soporta:
 * - `sqlite://database/empleanet.db` (relativo a la raíz del repo)
 * - `sqlite:///tmp/empleanet.db` (absoluto en Unix: rest empieza por `/…`)
 * - `sqlite:///C:/ruta/empleanet.db` (ruta con unidad en Windows: rest `/C:/…`)
 * - `sqlite://C:/ruta/empleanet.db` (ruta con unidad directa, sin `/` previo: rest `C:/…`)
 */
function resolveDbFilePath(): string {
  const url = env.DATABASE_URL;
  if (!url.startsWith(SQLITE_URL_PREFIX)) {
    return path.join(repoRoot, "database", "empleanet.db");
  }
  const rest = url.slice(SQLITE_URL_PREFIX.length);
  if (rest.length === 0) {
    return path.join(repoRoot, "database", "empleanet.db");
  }
  if (path.isAbsolute(rest)) {
    return path.normalize(rest);
  }
  if (process.platform === "win32" && /^\/[a-zA-Z]:\//.test(rest)) {
    return path.normalize(rest.slice(1));
  }
  if (rest.startsWith("/")) {
    return path.normalize(rest);
  }
  return path.normalize(path.join(repoRoot, rest));
}

let db: Database.Database | null = null;
let devInitialized = false;

function ensureEmpleoModalidadColumn(database: Database.Database): void {
  const columns = database.pragma("table_info(empleo)") as { name: string }[];
  if (!columns.some((c) => c.name === "modalidad")) {
    database.exec("ALTER TABLE empleo ADD COLUMN modalidad TEXT");
  }
  database.exec("CREATE INDEX IF NOT EXISTS idx_empleo_modalidad ON empleo(modalidad)");
}

function ensureDevDatabase(database: Database.Database): void {
  if (process.env.NODE_ENV === "production") return;
  if (devInitialized) return;
  devInitialized = true;

  const schemaPath = path.join(repoRoot, "database", "schema.sql");
  const seedsPath = path.join(repoRoot, "database", "seeds.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  database.exec(schema);
  ensureEmpleoModalidadColumn(database);

  const row = database.prepare("SELECT COUNT(*) AS c FROM empleo").get() as { c: number };
  if (row.c === 0) {
    const seeds = fs.readFileSync(seedsPath, "utf8");
    database.exec(seeds);
  }
}

export function getDb(): Database.Database {
  if (db === null) {
    const dbPath = resolveDbFilePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma("foreign_keys = ON");
    ensureDevDatabase(db);
    ensureAuthSchema();
    ensurePostulacionFavoritoSchema();
  }
  return db;
}
