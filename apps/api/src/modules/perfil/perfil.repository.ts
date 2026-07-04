import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RolUsuario } from "../../core/auth/types.js";
import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import { calcularCompletitud } from "./perfil.completitud.js";
import { ensureProfileSchema } from "./ensureProfileSchema.js";
import type {
  CreateExperienciaBody,
  Experiencia,
  Perfil,
  PerfilDetalle,
  UpdateExperienciaBody,
  UpdateInteresesBody,
  UpdatePerfilBody,
  UpdateSkillsBody,
} from "./perfil.schema.js";

type PerfilRow = {
  id: number;
  nombre: string;
  email: string;
  ubicacion: string | null;
  habilidades: string;
  usuario_id: number | null;
  telefono: string | null;
  resumen: string | null;
  carrera_id: number | null;
  ciclo_actual: number | null;
  anio_egreso: number | null;
  cv_ruta: string | null;
  cv_nombre: string | null;
  completitud_pct: number;
  perfil_completo: number;
};

type CarreraRow = { id: number; nombre: string; area: string | null };
type ExperienciaRow = {
  id: number;
  empresa: string;
  cargo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  actual: number;
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../..",
);
const cvDir = path.join(repoRoot, "uploads", "cv");

function parseSkills(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function serializeSkills(skills: string[]): string {
  return skills.map((s) => s.trim().toLowerCase()).filter(Boolean).join(",");
}

function ensureSkillIds(nombres: string[]): number[] {
  ensureProfileSchema();
  const db = getDb();
  const find = db.prepare("SELECT id FROM habilidad WHERE nombre = ? COLLATE NOCASE");
  const insert = db.prepare("INSERT INTO habilidad (nombre) VALUES (?)");
  const ids: number[] = [];
  for (const nombre of nombres) {
    const key = nombre.trim().toLowerCase();
    if (!key) continue;
    const row = find.get(key) as { id: number } | undefined;
    if (row) ids.push(row.id);
    else ids.push(Number(insert.run(key).lastInsertRowid));
  }
  return ids;
}

function ensureInteresIds(nombres: string[]): number[] {
  ensureProfileSchema();
  const db = getDb();
  const find = db.prepare("SELECT id FROM interes WHERE nombre = ? COLLATE NOCASE");
  const insert = db.prepare("INSERT INTO interes (nombre) VALUES (?)");
  const ids: number[] = [];
  for (const nombre of nombres) {
    const key = nombre.trim();
    if (!key) continue;
    const row = find.get(key) as { id: number } | undefined;
    if (row) ids.push(row.id);
    else ids.push(Number(insert.run(key).lastInsertRowid));
  }
  return ids;
}

export class PerfilRepository {
  private getRow(perfilId: number): PerfilRow {
    ensureProfileSchema();
    const row = getDb()
      .prepare(
        `SELECT id, nombre, email, ubicacion, habilidades, usuario_id,
                telefono, resumen, carrera_id, ciclo_actual, anio_egreso,
                cv_ruta, cv_nombre, completitud_pct, perfil_completo
         FROM perfil WHERE id = ?`,
      )
      .get(perfilId) as PerfilRow | undefined;
    if (!row) throw new AppError(404, "Perfil no encontrado");
    return row;
  }

  getUsuarioRol(usuarioId: number): RolUsuario {
    const row = getDb()
      .prepare("SELECT rol FROM usuario WHERE id = ?")
      .get(usuarioId) as { rol: RolUsuario } | undefined;
    if (!row) throw new AppError(404, "Usuario no encontrado");
    if (row.rol !== "estudiante" && row.rol !== "egresado") {
      throw new AppError(403, "Perfil académico no disponible para este rol");
    }
    return row.rol;
  }

  listSkills(perfilId: number): string[] {
    ensureProfileSchema();
    const rows = getDb()
      .prepare(
        `SELECT h.nombre FROM perfil_habilidad ph
         INNER JOIN habilidad h ON h.id = ph.habilidad_id
         WHERE ph.perfil_id = ? ORDER BY h.nombre`,
      )
      .all(perfilId) as { nombre: string }[];
    if (rows.length > 0) return rows.map((r) => r.nombre);
    return parseSkills(this.getRow(perfilId).habilidades);
  }

  listIntereses(perfilId: number): string[] {
    ensureProfileSchema();
    const rows = getDb()
      .prepare(
        `SELECT i.nombre FROM perfil_interes pi
         INNER JOIN interes i ON i.id = pi.interes_id
         WHERE pi.perfil_id = ? ORDER BY i.nombre`,
      )
      .all(perfilId) as { nombre: string }[];
    return rows.map((r) => r.nombre);
  }

  listExperiencias(perfilId: number): Experiencia[] {
    ensureProfileSchema();
    const rows = getDb()
      .prepare(
        `SELECT id, empresa, cargo, descripcion, fecha_inicio, fecha_fin, actual
         FROM experiencia WHERE perfil_id = ? ORDER BY fecha_inicio DESC, id DESC`,
      )
      .all(perfilId) as ExperienciaRow[];
    return rows.map((r) => ({
      id: String(r.id),
      empresa: r.empresa,
      cargo: r.cargo,
      descripcion: r.descripcion ?? undefined,
      fechaInicio: r.fecha_inicio,
      fechaFin: r.fecha_fin ?? undefined,
      actual: r.actual === 1,
    }));
  }

  getCarrera(carreraId: number | null): CarreraRow | null {
    if (!carreraId) return null;
    return (
      (getDb()
        .prepare("SELECT id, nombre, area FROM carrera WHERE id = ?")
        .get(carreraId) as CarreraRow | undefined) ?? null
    );
  }

  listCarreras() {
    ensureProfileSchema();
    return getDb()
      .prepare("SELECT id, nombre, area FROM carrera ORDER BY nombre")
      .all() as CarreraRow[];
  }

  countExperiencias(perfilId: number): number {
    ensureProfileSchema();
    const row = getDb()
      .prepare("SELECT COUNT(*) AS c FROM experiencia WHERE perfil_id = ?")
      .get(perfilId) as { c: number };
    return row.c;
  }

  recalcularCompletitud(perfilId: number, rol: RolUsuario) {
    const row = this.getRow(perfilId);
    const skills = this.listSkills(perfilId);
    const intereses = this.listIntereses(perfilId);
    const resultado = calcularCompletitud({
      nombre: row.nombre,
      telefono: row.telefono,
      ubicacion: row.ubicacion,
      resumen: row.resumen,
      carreraId: row.carrera_id,
      cicloActual: row.ciclo_actual,
      anioEgreso: row.anio_egreso,
      rol,
      skillsCount: skills.length,
      interesesCount: intereses.length,
      experienciasCount: this.countExperiencias(perfilId),
      tieneCv: Boolean(row.cv_ruta),
    });
    getDb()
      .prepare(
        `UPDATE perfil SET completitud_pct = ?, perfil_completo = ? WHERE id = ?`,
      )
      .run(
        resultado.porcentaje,
        resultado.completo ? 1 : 0,
        perfilId,
      );
    return resultado;
  }

  mapDetalle(perfilId: number, rol: RolUsuario): PerfilDetalle {
    const row = this.getRow(perfilId);
    const carrera = this.getCarrera(row.carrera_id);
    const skills = this.listSkills(perfilId);
    const intereses = this.listIntereses(perfilId);
    const experiencias = this.listExperiencias(perfilId);
    const completitud = this.recalcularCompletitud(perfilId, rol);

    return {
      id: String(row.id),
      name: row.nombre,
      email: row.email,
      telefono: row.telefono ?? undefined,
      resumen: row.resumen ?? undefined,
      location: row.ubicacion ?? undefined,
      rol,
      carrera: carrera
        ? {
            id: String(carrera.id),
            nombre: carrera.nombre,
            area: carrera.area ?? undefined,
          }
        : undefined,
      cicloActual: row.ciclo_actual ?? undefined,
      anioEgreso: row.anio_egreso ?? undefined,
      skills,
      intereses,
      experiencias,
      cv:
        row.cv_ruta && row.cv_nombre
          ? { nombre: row.cv_nombre, url: `/api/perfil/me/cv` }
          : undefined,
      completitud,
    };
  }

  findById(perfilId: number): Perfil | null {
    ensureProfileSchema();
    const row = getDb()
      .prepare(
        `SELECT id, nombre, email, ubicacion, habilidades, carrera_id
         FROM perfil WHERE id = ?`,
      )
      .get(perfilId) as
      | (Pick<PerfilRow, "id" | "nombre" | "email" | "ubicacion" | "habilidades"> & {
          carrera_id: number | null;
        })
      | undefined;
    if (!row) return null;
    const skills = this.listSkills(perfilId);
    const intereses = this.listIntereses(perfilId);
    const carrera = this.getCarrera(row.carrera_id);
    const expCount = this.countExperiencias(perfilId);
    return {
      id: String(row.id),
      name: row.nombre,
      email: row.email,
      location: row.ubicacion ?? undefined,
      skills,
      carreraNombre: carrera?.nombre,
      intereses,
      aniosExperiencia: expCount > 0 ? Math.min(expCount * 2, 10) : 0,
    };
  }

  getByIdForUser(perfilId: number, userId: number): PerfilDetalle {
    const row = getDb()
      .prepare("SELECT id, usuario_id FROM perfil WHERE id = ? AND usuario_id = ?")
      .get(perfilId, userId) as { id: number; usuario_id: number } | undefined;
    if (!row) throw new AppError(404, "Perfil no encontrado");
    const rol = this.getUsuarioRol(userId);
    return this.mapDetalle(perfilId, rol);
  }

  getByUsuarioId(usuarioId: number): PerfilDetalle | null {
    const row = getDb()
      .prepare("SELECT id FROM perfil WHERE usuario_id = ?")
      .get(usuarioId) as { id: number } | undefined;
    if (!row) return null;
    const rol = this.getUsuarioRol(usuarioId);
    return this.mapDetalle(row.id, rol);
  }

  updatePersonal(perfilId: number, userId: number, data: UpdatePerfilBody): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    getDb()
      .prepare(
        `UPDATE perfil SET nombre = ?, telefono = ?, resumen = ?, ubicacion = ?,
         carrera_id = ?, ciclo_actual = ?, anio_egreso = ?
         WHERE id = ? AND usuario_id = ?`,
      )
      .run(
        data.name,
        data.telefono ?? null,
        data.resumen ?? null,
        data.location ?? null,
        data.carreraId ?? null,
        rol === "estudiante" ? (data.cicloActual ?? null) : null,
        rol === "egresado" ? (data.anioEgreso ?? null) : null,
        perfilId,
        userId,
      );
    return this.mapDetalle(perfilId, rol);
  }

  replaceSkills(perfilId: number, userId: number, data: UpdateSkillsBody): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    const db = getDb();
    const ids = ensureSkillIds(data.skills);
    db.transaction(() => {
      db.prepare("DELETE FROM perfil_habilidad WHERE perfil_id = ?").run(perfilId);
      const insert = db.prepare(
        "INSERT INTO perfil_habilidad (perfil_id, habilidad_id) VALUES (?, ?)",
      );
      for (const hid of ids) insert.run(perfilId, hid);
      db.prepare("UPDATE perfil SET habilidades = ? WHERE id = ?").run(
        serializeSkills(data.skills),
        perfilId,
      );
    })();
    return this.mapDetalle(perfilId, rol);
  }

  replaceIntereses(
    perfilId: number,
    userId: number,
    data: UpdateInteresesBody,
  ): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    const db = getDb();
    const ids = ensureInteresIds(data.intereses);
    db.transaction(() => {
      db.prepare("DELETE FROM perfil_interes WHERE perfil_id = ?").run(perfilId);
      const insert = db.prepare(
        "INSERT INTO perfil_interes (perfil_id, interes_id) VALUES (?, ?)",
      );
      for (const iid of ids) insert.run(perfilId, iid);
    })();
    return this.mapDetalle(perfilId, rol);
  }

  addExperiencia(
    perfilId: number,
    userId: number,
    data: CreateExperienciaBody,
  ): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    getDb()
      .prepare(
        `INSERT INTO experiencia (perfil_id, empresa, cargo, descripcion, fecha_inicio, fecha_fin, actual)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        perfilId,
        data.empresa,
        data.cargo,
        data.descripcion ?? null,
        data.fechaInicio,
        data.fechaFin ?? null,
        data.actual ? 1 : 0,
      );
    return this.mapDetalle(perfilId, rol);
  }

  updateExperiencia(
    perfilId: number,
    userId: number,
    expId: number,
    data: UpdateExperienciaBody,
  ): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    const result = getDb()
      .prepare(
        `UPDATE experiencia SET empresa = ?, cargo = ?, descripcion = ?,
         fecha_inicio = ?, fecha_fin = ?, actual = ?
         WHERE id = ? AND perfil_id = ?`,
      )
      .run(
        data.empresa,
        data.cargo,
        data.descripcion ?? null,
        data.fechaInicio,
        data.fechaFin ?? null,
        data.actual ? 1 : 0,
        expId,
        perfilId,
      );
    if (result.changes === 0) throw new AppError(404, "Experiencia no encontrada");
    return this.mapDetalle(perfilId, rol);
  }

  deleteExperiencia(perfilId: number, userId: number, expId: number): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    const result = getDb()
      .prepare("DELETE FROM experiencia WHERE id = ? AND perfil_id = ?")
      .run(expId, perfilId);
    if (result.changes === 0) throw new AppError(404, "Experiencia no encontrada");
    return this.mapDetalle(perfilId, rol);
  }

  saveCv(
    perfilId: number,
    userId: number,
    filename: string,
    buffer: Buffer,
  ): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    fs.mkdirSync(cvDir, { recursive: true });
    const safeName = `${userId}-${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const fullPath = path.join(cvDir, safeName);
    fs.writeFileSync(fullPath, buffer);
    const row = this.getRow(perfilId);
    if (row.cv_ruta && fs.existsSync(row.cv_ruta)) {
      try {
        fs.unlinkSync(row.cv_ruta);
      } catch {
        /* ignore */
      }
    }
    getDb()
      .prepare("UPDATE perfil SET cv_ruta = ?, cv_nombre = ? WHERE id = ?")
      .run(fullPath, filename, perfilId);
    return this.mapDetalle(perfilId, rol);
  }

  getCvPath(perfilId: number, userId: number): { path: string; nombre: string } {
    const row = this.getByIdForUser(perfilId, userId);
    const dbRow = this.getRow(perfilId);
    if (!dbRow.cv_ruta || !fs.existsSync(dbRow.cv_ruta)) {
      throw new AppError(404, "CV no encontrado");
    }
    return { path: dbRow.cv_ruta, nombre: row.cv?.nombre ?? "cv.pdf" };
  }

  deleteCv(perfilId: number, userId: number): PerfilDetalle {
    this.getByIdForUser(perfilId, userId);
    const rol = this.getUsuarioRol(userId);
    const row = this.getRow(perfilId);
    if (row.cv_ruta && fs.existsSync(row.cv_ruta)) {
      try {
        fs.unlinkSync(row.cv_ruta);
      } catch {
        /* ignore */
      }
    }
    getDb()
      .prepare("UPDATE perfil SET cv_ruta = NULL, cv_nombre = NULL WHERE id = ?")
      .run(perfilId);
    return this.mapDetalle(perfilId, rol);
  }

  listUsuariosConPerfil(limit: number, offset: number) {
    ensureProfileSchema();
    return getDb()
      .prepare(
        `SELECT u.id, u.email, u.rol, p.id AS perfil_id, p.nombre, p.completitud_pct, p.perfil_completo
         FROM usuario u
         INNER JOIN perfil p ON p.usuario_id = u.id
         WHERE u.rol IN ('estudiante', 'egresado')
         ORDER BY p.completitud_pct ASC, u.email ASC
         LIMIT ? OFFSET ?`,
      )
      .all(limit, offset) as {
      id: number;
      email: string;
      rol: RolUsuario;
      perfil_id: number;
      nombre: string;
      completitud_pct: number;
      perfil_completo: number;
    }[];
  }
}
