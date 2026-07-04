-- Tabla de usuarios y vínculo perfil-usuario (Fase 3)

CREATE TABLE IF NOT EXISTS usuario (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);

-- En bases existentes: ALTER TABLE perfil ADD COLUMN usuario_id INTEGER UNIQUE REFERENCES usuario(id);
