import { getDb } from "../../core/db/conexion.js";
import { hashPassword, verifyPassword } from "../../core/auth/password.js";
import type { RolUsuario } from "../../core/auth/types.js";
import { DEMO_PASSWORD, DEMO_USERS } from "./auth.schema.js";

type UsuarioRow = {
  id: number;
  email: string;
  password_hash: string;
  rol: RolUsuario;
  activo: number;
};

type PerfilRow = {
  id: number;
  usuario_id: number | null;
  nombre: string;
  email: string;
};

export class AuthRepository {
  findByEmail(email: string): UsuarioRow | null {
    const row = getDb()
      .prepare(
        "SELECT id, email, password_hash, rol, activo FROM usuario WHERE email = ? COLLATE NOCASE",
      )
      .get(email.trim().toLowerCase()) as UsuarioRow | undefined;
    return row ?? null;
  }

  findById(id: number): UsuarioRow | null {
    const row = getDb()
      .prepare(
        "SELECT id, email, password_hash, rol, activo FROM usuario WHERE id = ?",
      )
      .get(id) as UsuarioRow | undefined;
    return row ?? null;
  }

  findPerfilByUsuarioId(usuarioId: number): PerfilRow | null {
    const row = getDb()
      .prepare(
        "SELECT id, usuario_id, nombre, email FROM perfil WHERE usuario_id = ?",
      )
      .get(usuarioId) as PerfilRow | undefined;
    return row ?? null;
  }

  ensurePerfilForUsuario(
    usuario: UsuarioRow,
    defaults: { name: string; skills: string; location: string },
  ): PerfilRow {
    const existing = this.findPerfilByUsuarioId(usuario.id);
    if (existing) return existing;

    const db = getDb();
    const byEmail = db
      .prepare("SELECT id, usuario_id, nombre, email FROM perfil WHERE email = ?")
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
        `INSERT INTO perfil (usuario_id, nombre, email, ubicacion, habilidades)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        usuario.id,
        defaults.name,
        usuario.email,
        defaults.location,
        defaults.skills,
      );

    return {
      id: Number(result.lastInsertRowid),
      usuario_id: usuario.id,
      nombre: defaults.name,
      email: usuario.email,
    };
  }

  seedDemoUsersIfEmpty(): void {
    const db = getDb();
    const count = db.prepare("SELECT COUNT(*) AS c FROM usuario").get() as {
      c: number;
    };
    if (count.c > 0) return;

    const passwordHash = hashPassword(DEMO_PASSWORD);
    const insertUser = db.prepare(
      `INSERT INTO usuario (email, password_hash, rol, activo)
       VALUES (?, ?, ?, 1)`,
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
        },
        {
          name: demo.name,
          skills: demo.skills,
          location: demo.location,
        },
      );
    }
  }

  verifyCredentials(email: string, password: string): UsuarioRow | null {
    const user = this.findByEmail(email);
    if (!user || user.activo !== 1) return null;
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

  const cols = db.pragma("table_info(perfil)") as { name: string }[];
  if (!cols.some((c) => c.name === "usuario_id")) {
    db.exec(
      `ALTER TABLE perfil ADD COLUMN usuario_id INTEGER UNIQUE REFERENCES usuario(id)`,
    );
  }

  new AuthRepository().seedDemoUsersIfEmpty();
}
