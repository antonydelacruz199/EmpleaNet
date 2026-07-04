import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../../core/db/conexion.js";

export function ensureApplicationsTrackingSchema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../../database/migrations/011_applications_tracking.sql",
  );
  getDb().exec(fs.readFileSync(migrationPath, "utf8"));
}
