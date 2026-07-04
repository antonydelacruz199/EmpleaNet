-- Extensión auth: tokens de restablecimiento (PROMPT 2)

CREATE TABLE IF NOT EXISTS password_reset_token (
  id INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TEXT NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_token(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expira ON password_reset_token(expira_en);
