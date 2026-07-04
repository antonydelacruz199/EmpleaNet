-- Módulo de perfiles (PROMPT 3): catálogos, relaciones y experiencia

CREATE TABLE IF NOT EXISTS carrera (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  area TEXT
);

CREATE TABLE IF NOT EXISTS habilidad (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS interes (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS perfil_habilidad (
  perfil_id INTEGER NOT NULL REFERENCES perfil(id) ON DELETE CASCADE,
  habilidad_id INTEGER NOT NULL REFERENCES habilidad(id) ON DELETE CASCADE,
  PRIMARY KEY (perfil_id, habilidad_id)
);

CREATE TABLE IF NOT EXISTS perfil_interes (
  perfil_id INTEGER NOT NULL REFERENCES perfil(id) ON DELETE CASCADE,
  interes_id INTEGER NOT NULL REFERENCES interes(id) ON DELETE CASCADE,
  PRIMARY KEY (perfil_id, interes_id)
);

CREATE TABLE IF NOT EXISTS experiencia (
  id INTEGER PRIMARY KEY,
  perfil_id INTEGER NOT NULL REFERENCES perfil(id) ON DELETE CASCADE,
  empresa TEXT NOT NULL,
  cargo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT,
  actual INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experiencia_perfil ON experiencia(perfil_id);

-- Catálogo inicial
INSERT OR IGNORE INTO carrera (nombre, area) VALUES
  ('Ingeniería de Software', 'Ingeniería'),
  ('Ingeniería de Sistemas', 'Ingeniería'),
  ('Administración de Empresas', 'Negocios'),
  ('Marketing', 'Negocios'),
  ('Diseño Gráfico', 'Creatividad'),
  ('Psicología', 'Ciencias Sociales');

INSERT OR IGNORE INTO habilidad (nombre) VALUES
  ('typescript'), ('javascript'), ('react'), ('nodejs'), ('python'),
  ('sql'), ('comunicacion'), ('liderazgo'), ('git'), ('figma');

INSERT OR IGNORE INTO interes (nombre) VALUES
  ('Desarrollo web'), ('Data analytics'), ('Product management'),
  ('UX/UI'), ('Remoto'), ('Startups'), ('Consultoría'), ('Fintech');
