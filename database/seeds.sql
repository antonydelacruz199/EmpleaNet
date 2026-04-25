BEGIN TRANSACTION;

INSERT OR IGNORE INTO fuente_empleo (id, nombre, tipo, url, activa) VALUES
  (1, 'RemotoJobs', 'api', 'https://remotojobs.example/api', 1),
  (2, 'TechFeed', 'rss', 'https://techfeed.example/rss', 1);

INSERT OR IGNORE INTO empleo (id, fuente_id, titulo, empresa, ubicacion, modalidad, descripcion, url_oferta, salario, fecha_publicacion) VALUES
  (1, 1, 'Desarrollador Frontend React', 'Acme', 'Remoto', 'remoto', 'Construcción de interfaces con React y TypeScript.', 'https://empleos.example/1', 'USD 2500-3200', '2026-04-18'),
  (2, 2, 'Ingeniero Backend Node.js', 'Globex', 'Madrid', 'presencial', 'APIs con Node.js, Express y PostgreSQL.', 'https://empleos.example/2', 'EUR 32000-42000', '2026-04-16'),
  (3, 1, 'Fullstack TypeScript', 'Initech', 'Barcelona', 'hibrido', 'Desarrollo fullstack con React y Node.js.', 'https://empleos.example/3', 'EUR 38000-48000', '2026-04-14');

INSERT OR IGNORE INTO perfil (id, nombre, email, ubicacion, habilidades) VALUES
  (1, 'Ana Pérez', 'ana@empleanet.local', 'Remoto', 'typescript,react,nodejs');

INSERT OR IGNORE INTO recomendacion (id, perfil_id, empleo_id, puntaje, motivo) VALUES
  (1, 1, 1, 0.95, 'Alta coincidencia en React y TypeScript'),
  (2, 1, 3, 0.88, 'Buena coincidencia fullstack en TypeScript');

COMMIT;
