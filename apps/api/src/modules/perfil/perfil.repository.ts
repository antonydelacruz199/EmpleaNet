import { getDb } from "../../core/db/conexion.js";
import {
  PERFIL_DEMO_ID,
  type Perfil,
  type UpdatePerfilBody,
} from "./perfil.schema.js";

type PerfilRow = {
  id: number;
  nombre: string;
  email: string;
  ubicacion: string | null;
  habilidades: string;
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
  private ensureDemoPerfil(): PerfilRow {
    const db = getDb();
    const existing = db
      .prepare(
        "SELECT id, nombre, email, ubicacion, habilidades FROM perfil WHERE id = ?",
      )
      .get(PERFIL_DEMO_ID) as PerfilRow | undefined;

    if (existing) return existing;

    db.prepare(
      `INSERT INTO perfil (id, nombre, email, ubicacion, habilidades)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(
      PERFIL_DEMO_ID,
      "Estudiante Continental",
      "estudiante@continental.edu.pe",
      "Remoto",
      "typescript,react",
    );

    return db
      .prepare(
        "SELECT id, nombre, email, ubicacion, habilidades FROM perfil WHERE id = ?",
      )
      .get(PERFIL_DEMO_ID) as PerfilRow;
  }

  getCurrent(): Promise<Perfil> {
    const row = this.ensureDemoPerfil();
    return Promise.resolve(mapRow(row));
  }

  updateCurrent(data: UpdatePerfilBody): Promise<Perfil> {
    this.ensureDemoPerfil();
    const db = getDb();
    db.prepare(
      `UPDATE perfil SET nombre = ?, ubicacion = ?, habilidades = ? WHERE id = ?`,
    ).run(
      data.name,
      data.location ?? null,
      serializeSkills(data.skills),
      PERFIL_DEMO_ID,
    );
    const row = db
      .prepare(
        "SELECT id, nombre, email, ubicacion, habilidades FROM perfil WHERE id = ?",
      )
      .get(PERFIL_DEMO_ID) as PerfilRow;
    return Promise.resolve(mapRow(row));
  }
}
