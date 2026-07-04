-- O4: catálogo de estados, historial de vistas y seguimiento

CREATE TABLE IF NOT EXISTS estado_postulacion (
  codigo TEXT PRIMARY KEY,
  etiqueta TEXT NOT NULL,
  descripcion TEXT
);

INSERT OR IGNORE INTO estado_postulacion (codigo, etiqueta, descripcion) VALUES
  ('registrada', 'Registrada', 'Postulación registrada en la plataforma'),
  ('en_proceso', 'En proceso', 'Seguimiento activo de la postulación'),
  ('cerrada', 'Cerrada', 'Postulación finalizada o descartada');

CREATE TABLE IF NOT EXISTS oportunidad_vista (
  id INTEGER PRIMARY KEY,
  perfil_id INTEGER NOT NULL,
  empleo_id INTEGER NOT NULL,
  visto_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfil_id) REFERENCES perfil(id),
  FOREIGN KEY (empleo_id) REFERENCES empleo(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vista_perfil_empleo ON oportunidad_vista(perfil_id, empleo_id);
CREATE INDEX IF NOT EXISTS idx_vista_perfil_id ON oportunidad_vista(perfil_id);
CREATE INDEX IF NOT EXISTS idx_vista_visto_en ON oportunidad_vista(visto_en);
