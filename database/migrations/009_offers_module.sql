-- Módulo O2: gestión de ofertas laborales y prácticas

CREATE TABLE IF NOT EXISTS empresa (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  sector TEXT,
  contacto_email TEXT,
  activa INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO empresa (nombre, sector, contacto_email) VALUES
  ('Acme Corp', 'Tecnología', 'talento@acme.example'),
  ('Globex SA', 'Consultoría', 'rrhh@globex.example'),
  ('Universidad Continental', 'Educación', 'empleabilidad@continental.edu.pe');

CREATE INDEX IF NOT EXISTS idx_empresa_activa ON empresa(activa);
