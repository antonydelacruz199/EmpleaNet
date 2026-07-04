-- Módulo O3: búsqueda, filtros y motor de recomendación

CREATE TABLE IF NOT EXISTS recommendation_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  puntaje_minimo INTEGER NOT NULL DEFAULT 40,
  penalizacion_postulado REAL NOT NULL DEFAULT 15,
  version TEXT NOT NULL DEFAULT '1.0',
  actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO recommendation_settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS preferencia_laboral (
  perfil_id INTEGER PRIMARY KEY,
  modalidad_preferida TEXT,
  ubicacion_preferida TEXT,
  categorias_interes TEXT,
  actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfil_id) REFERENCES perfil(id)
);
