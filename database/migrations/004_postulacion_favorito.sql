-- Postulaciones y favoritos (Fase 4 — Bizagi O4)

CREATE TABLE IF NOT EXISTS postulacion (
  id INTEGER PRIMARY KEY,
  perfil_id INTEGER NOT NULL,
  empleo_id INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'registrada',
  fecha_postulacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfil_id) REFERENCES perfil(id),
  FOREIGN KEY (empleo_id) REFERENCES empleo(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_postulacion_perfil_empleo ON postulacion(perfil_id, empleo_id);
CREATE INDEX IF NOT EXISTS idx_postulacion_perfil_id ON postulacion(perfil_id);

CREATE TABLE IF NOT EXISTS favorito (
  id INTEGER PRIMARY KEY,
  perfil_id INTEGER NOT NULL,
  empleo_id INTEGER NOT NULL,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfil_id) REFERENCES perfil(id),
  FOREIGN KEY (empleo_id) REFERENCES empleo(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorito_perfil_empleo ON favorito(perfil_id, empleo_id);
CREATE INDEX IF NOT EXISTS idx_favorito_perfil_id ON favorito(perfil_id);
