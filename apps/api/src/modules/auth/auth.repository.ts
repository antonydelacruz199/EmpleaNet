import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../../core/db/conexion.js";
import { hashPassword, verifyPassword } from "../../core/auth/password.js";
import type { RolUsuario } from "../../core/auth/types.js";
import {
  AUTH_LOCK_MAX_ATTEMPTS,
  AUTH_LOCK_MINUTES,
  DEMO_PASSWORD,
  DEMO_USERS,
  RESET_TOKEN_HOURS,
  type RegisterBody,
} from "./auth.schema.js";

type UsuarioRow = {
  id: number;
  email: string;
  password_hash: string;
  rol: RolUsuario;
  activo: number;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
};

type PerfilRow = {
  id: number;
  usuario_id: number | null;
  nombre: string;
  email: string;
  perfil_completo: number;
};

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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

export class AuthRepository {
  findByEmail(email: string): UsuarioRow | null {
    const row = getDb()
      .prepare(
        `SELECT id, email, password_hash, rol, activo, intentos_fallidos, bloqueado_hasta
         FROM usuario WHERE email = ? COLLATE NOCASE`,
      )
      .get(email.trim().toLowerCase()) as UsuarioRow | undefined;
    return row ?? null;
  }

  findById(id: number): UsuarioRow | null {
    const row = getDb()
      .prepare(
        `SELECT id, email, password_hash, rol, activo, intentos_fallidos, bloqueado_hasta
         FROM usuario WHERE id = ?`,
      )
      .get(id) as UsuarioRow | undefined;
    return row ?? null;
  }

  findPerfilByUsuarioId(usuarioId: number): PerfilRow | null {
    const row = getDb()
      .prepare(
        `SELECT id, usuario_id, nombre, email, perfil_completo
         FROM perfil WHERE usuario_id = ?`,
      )
      .get(usuarioId) as PerfilRow | undefined;
    return row ?? null;
  }

  isAccountLocked(usuario: UsuarioRow): boolean {
    if (!usuario.bloqueado_hasta) return false;
    const until = new Date(usuario.bloqueado_hasta).getTime();
    if (Number.isNaN(until) || until <= Date.now()) {
      this.clearLockout(usuario.id);
      return false;
    }
    return true;
  }

  clearLockout(usuarioId: number): void {
    getDb()
      .prepare(
        `UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?`,
      )
      .run(usuarioId);
  }

  recordFailedLogin(usuario: UsuarioRow): number {
    const intentos = usuario.intentos_fallidos + 1;
    const db = getDb();
    if (intentos >= AUTH_LOCK_MAX_ATTEMPTS) {
      const bloqueadoHasta = new Date(
        Date.now() + AUTH_LOCK_MINUTES * 60 * 1000,
      ).toISOString();
      db.prepare(
        `UPDATE usuario SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?`,
      ).run(intentos, bloqueadoHasta, usuario.id);
    } else {
      db.prepare(`UPDATE usuario SET intentos_fallidos = ? WHERE id = ?`).run(
        intentos,
        usuario.id,
      );
    }
    return intentos;
  }

  resetFailedLoginAttempts(usuarioId: number): void {
    this.clearLockout(usuarioId);
  }

  createUser(input: RegisterBody): UsuarioRow {
    const email = input.email.trim().toLowerCase();
    const passwordHash = hashPassword(input.password);
    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO usuario (email, password_hash, rol, activo, intentos_fallidos)
         VALUES (?, ?, ?, 1, 0)`,
      )
      .run(email, passwordHash, input.rol);

    const usuario: UsuarioRow = {
      id: Number(result.lastInsertRowid),
      email,
      password_hash: passwordHash,
      rol: input.rol,
      activo: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    };

    db.prepare(
      `INSERT INTO perfil (usuario_id, nombre, email, ubicacion, habilidades, perfil_completo)
       VALUES (?, ?, ?, NULL, '', 0)`,
    ).run(usuario.id, input.name.trim(), email);

    return usuario;
  }

  createPasswordResetToken(usuarioId: number): string {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiraEn = new Date(
      Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000,
    ).toISOString();

    getDb()
      .prepare(
        `INSERT INTO password_reset_token (usuario_id, token_hash, expira_en, usado)
         VALUES (?, ?, ?, 0)`,
      )
      .run(usuarioId, tokenHash, expiraEn);

    return token;
  }

  consumePasswordResetToken(
    token: string,
    newPassword: string,
  ): UsuarioRow | null {
    const tokenHash = hashResetToken(token);
    const db = getDb();
    const row = db
      .prepare(
        `SELECT id, usuario_id, expira_en, usado FROM password_reset_token WHERE token_hash = ?`,
      )
      .get(tokenHash) as
      | {
          id: number;
          usuario_id: number;
          expira_en: string;
          usado: number;
        }
      | undefined;

    if (!row || row.usado === 1) return null;
    if (new Date(row.expira_en).getTime() < Date.now()) return null;

    const usuario = this.findById(row.usuario_id);
    if (!usuario || usuario.activo !== 1) return null;

    const passwordHash = hashPassword(newPassword);
    db.prepare(`UPDATE usuario SET password_hash = ? WHERE id = ?`).run(
      passwordHash,
      usuario.id,
    );
    db.prepare(`UPDATE password_reset_token SET usado = 1 WHERE id = ?`).run(
      row.id,
    );
    this.resetFailedLoginAttempts(usuario.id);

    return { ...usuario, password_hash: passwordHash };
  }

  ensurePerfilForUsuario(
    usuario: UsuarioRow,
    defaults: { name: string; skills: string; location: string },
    perfilCompleto = 1,
  ): PerfilRow {
    const existing = this.findPerfilByUsuarioId(usuario.id);
    if (existing) return existing;

    const db = getDb();
    const byEmail = db
      .prepare(
        `SELECT id, usuario_id, nombre, email, perfil_completo FROM perfil WHERE email = ?`,
      )
      .get(usuario.email) as PerfilRow | undefined;

    if (byEmail && byEmail.usuario_id === null) {
      db.prepare("UPDATE perfil SET usuario_id = ? WHERE id = ?").run(
        usuario.id,
        byEmail.id,
      );
      return { ...byEmail, usuario_id: usuario.id };
    }

    const result = db
      .prepare(
        `INSERT INTO perfil (usuario_id, nombre, email, ubicacion, habilidades, perfil_completo)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        usuario.id,
        defaults.name,
        usuario.email,
        defaults.location,
        defaults.skills,
        perfilCompleto,
      );

    return {
      id: Number(result.lastInsertRowid),
      usuario_id: usuario.id,
      nombre: defaults.name,
      email: usuario.email,
      perfil_completo: perfilCompleto,
    };
  }

  markPerfilCompleto(usuarioId: number): void {
    getDb()
      .prepare(`UPDATE perfil SET perfil_completo = 1 WHERE usuario_id = ?`)
      .run(usuarioId);
  }

  seedDemoUsersIfEmpty(): void {
    const db = getDb();
    const count = db.prepare("SELECT COUNT(*) AS c FROM usuario").get() as {
      c: number;
    };
    if (count.c > 0) return;

    const passwordHash = hashPassword(DEMO_PASSWORD);
    const insertUser = db.prepare(
      `INSERT INTO usuario (email, password_hash, rol, activo, intentos_fallidos)
       VALUES (?, ?, ?, 1, 0)`,
    );

    for (const demo of DEMO_USERS) {
      const email = demo.email.toLowerCase();
      const result = insertUser.run(email, passwordHash, demo.rol);
      const usuarioId = Number(result.lastInsertRowid);
      this.ensurePerfilForUsuario(
        {
          id: usuarioId,
          email,
          password_hash: passwordHash,
          rol: demo.rol,
          activo: 1,
          intentos_fallidos: 0,
          bloqueado_hasta: null,
        },
        {
          name: demo.name,
          skills: demo.skills,
          location: demo.location,
        },
        1,
      );
    }
  }

  verifyCredentials(email: string, password: string): UsuarioRow | null {
    const user = this.findByEmail(email);
    if (!user || user.activo !== 1) return null;
    if (this.isAccountLocked(user)) return null;
    if (!verifyPassword(password, user.password_hash)) return null;
    return user;
  }
}

export function ensureAuthSchema(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
  `);

  addColumnIfMissing("usuario", "intentos_fallidos", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("usuario", "bloqueado_hasta", "TEXT");

  const cols = db.pragma("table_info(perfil)") as { name: string }[];
  if (!cols.some((c) => c.name === "usuario_id")) {
    db.exec(
      `ALTER TABLE perfil ADD COLUMN usuario_id INTEGER UNIQUE REFERENCES usuario(id)`,
    );
  }
  addColumnIfMissing("perfil", "perfil_completo", "INTEGER NOT NULL DEFAULT 0");
  db.prepare(
    `UPDATE perfil SET perfil_completo = 1 WHERE COALESCE(habilidades, '') != ''`,
  ).run();

  ensureAuthExtendedSchema();
  new AuthRepository().seedDemoUsersIfEmpty();
}

export function ensureAuthExtendedSchema(): void {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(
    dirname,
    "../../../../database/migrations/007_auth_extended.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");
  getDb().exec(sql);
}
