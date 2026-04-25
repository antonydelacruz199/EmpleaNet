CREATE TABLE IF NOT EXISTS fuente_empleo (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  url TEXT,
  activa INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS empleo (
  id INTEGER PRIMARY KEY,
  fuente_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  empresa TEXT NOT NULL,
  ubicacion TEXT,
  modalidad TEXT,
  descripcion TEXT,
  url_oferta TEXT,
  salario TEXT,
  fecha_publicacion TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fuente_id) REFERENCES fuente_empleo(id)
);

CREATE TABLE IF NOT EXISTS perfil (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  ubicacion TEXT,
  habilidades TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recomendacion (
  id INTEGER PRIMARY KEY,
  perfil_id INTEGER NOT NULL,
  empleo_id INTEGER NOT NULL,
  puntaje REAL NOT NULL,
  motivo TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfil_id) REFERENCES perfil(id),
  FOREIGN KEY (empleo_id) REFERENCES empleo(id)
);

CREATE INDEX IF NOT EXISTS idx_empleo_fuente_id ON empleo(fuente_id);
CREATE INDEX IF NOT EXISTS idx_empleo_fecha_publicacion ON empleo(fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_recomendacion_perfil_id ON recomendacion(perfil_id);
CREATE INDEX IF NOT EXISTS idx_recomendacion_empleo_id ON recomendacion(empleo_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recomendacion_perfil_empleo_unica ON recomendacion(perfil_id, empleo_id);
