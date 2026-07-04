-- Fase 6: auditoría, configuración del motor e incidencias de soporte

CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY,
  usuario_id INTEGER,
  accion TEXT NOT NULL,
  entidad TEXT,
  detalle TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_auditoria_creado_en ON auditoria(creado_en);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);

CREATE TABLE IF NOT EXISTS motor_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  habilidades REAL NOT NULL DEFAULT 30,
  carrera REAL NOT NULL DEFAULT 25,
  experiencia REAL NOT NULL DEFAULT 15,
  modalidad REAL NOT NULL DEFAULT 15,
  ubicacion REAL NOT NULL DEFAULT 10,
  actualidad REAL NOT NULL DEFAULT 5,
  actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO motor_config (id) VALUES (1);

CREATE TABLE IF NOT EXISTS incidencia (
  id INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'abierta',
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_incidencia_estado ON incidencia(estado);
CREATE INDEX IF NOT EXISTS idx_incidencia_usuario_id ON incidencia(usuario_id);
