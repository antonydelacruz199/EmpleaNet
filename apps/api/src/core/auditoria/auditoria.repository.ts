import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../db/conexion.js";

export type RegistroAuditoria = {
  id: string;
  usuarioId: string | null;
  accion: string;
  entidad: string | null;
  detalle: string | null;
  creadoEn: string;
};

type AuditoriaRow = {
  id: number;
  usuario_id: number | null;
  accion: string;
  entidad: string | null;
  detalle: string | null;
  creado_en: string;
};

export function ensureFase6Schema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../database/migrations/006_fase6_soporte_estrategia.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");
  getDb().exec(sql);
}

export class AuditoriaRepository {
  registrar(input: {
    usuarioId?: number | null;
    accion: string;
    entidad?: string;
    detalle?: string;
  }): void {
    ensureFase6Schema();
    getDb()
      .prepare(
        `INSERT INTO auditoria (usuario_id, accion, entidad, detalle)
         VALUES (?, ?, ?, ?)`,
      )
      .run(
        input.usuarioId ?? null,
        input.accion,
        input.entidad ?? null,
        input.detalle ?? null,
      );
  }

  listRecientes(limit: number): RegistroAuditoria[] {
    ensureFase6Schema();
    const rows = getDb()
      .prepare(
        `SELECT id, usuario_id, accion, entidad, detalle, creado_en
         FROM auditoria ORDER BY creado_en DESC, id DESC LIMIT ?`,
      )
      .all(limit) as AuditoriaRow[];
    return rows.map((row) => ({
      id: String(row.id),
      usuarioId: row.usuario_id === null ? null : String(row.usuario_id),
      accion: row.accion,
      entidad: row.entidad,
      detalle: row.detalle,
      creadoEn: row.creado_en,
    }));
  }
}
