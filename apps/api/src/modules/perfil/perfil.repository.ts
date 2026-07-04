import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import type { Perfil, UpdatePerfilBody } from "./perfil.schema.js";

type PerfilRow = {
  id: number;
  nombre: string;
  email: string;
  ubicacion: string | null;
  habilidades: string;
  usuario_id: number | null;
};

function parseSkills(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function serializeSkills(skills: string[]): string {
  return skills.map((s) => s.trim().toLowerCase()).filter(Boolean).join(",");
}

function mapRow(row: PerfilRow): Perfil {
  return {
    id: String(row.id),
    name: row.nombre,
    email: row.email,
    location: row.ubicacion ?? undefined,
    skills: parseSkills(row.habilidades),
  };
}

export class PerfilRepository {
  findById(perfilId: number): Perfil | null {
    const row = getDb()
      .prepare(
        "SELECT id, nombre, email, ubicacion, habilidades, usuario_id FROM perfil WHERE id = ?",
      )
      .get(perfilId) as PerfilRow | undefined;
    return row ? mapRow(row) : null;
  }

  getByIdForUser(perfilId: number, userId: number): Perfil {
    const row = getDb()
      .prepare(
        `SELECT id, nombre, email, ubicacion, habilidades, usuario_id
         FROM perfil WHERE id = ? AND usuario_id = ?`,
      )
      .get(perfilId, userId) as PerfilRow | undefined;

    if (!row) {
      throw new AppError(404, "Perfil no encontrado");
    }
    return mapRow(row);
  }

  updateById(perfilId: number, userId: number, data: UpdatePerfilBody): Perfil {
    this.getByIdForUser(perfilId, userId);
    const db = getDb();
    db.prepare(
      `UPDATE perfil SET nombre = ?, ubicacion = ?, habilidades = ? WHERE id = ? AND usuario_id = ?`,
    ).run(
      data.name,
      data.location ?? null,
      serializeSkills(data.skills),
      perfilId,
      userId,
    );
    return this.getByIdForUser(perfilId, userId);
  }
}
