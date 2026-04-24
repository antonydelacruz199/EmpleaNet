import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../config/env.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, "../../../../..");

function resolveDbFilePath(): string {
  const url = env.DATABASE_URL;
  if (url.startsWith("sqlite://")) {
    const rest = url.slice("sqlite://".length).replace(/^\/+/, "");
    if (path.isAbsolute(rest)) return rest;
    return path.join(repoRoot, rest);
  }
  return path.join(repoRoot, "database", "empleanet.db");
}

let db: Database.Database | null = null;
let devInitialized = false;

function ensureDevDatabase(database: Database.Database): void {
  if (process.env.NODE_ENV === "production") return;
  if (devInitialized) return;
  devInitialized = true;

  const schemaPath = path.join(repoRoot, "database", "schema.sql");
  const seedsPath = path.join(repoRoot, "database", "seeds.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  database.exec(schema);

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
  }
  return db;
}
