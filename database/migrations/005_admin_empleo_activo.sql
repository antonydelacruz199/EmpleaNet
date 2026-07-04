-- Fase 5: archivado lógico de ofertas y fuente institucional manual

ALTER TABLE empleo ADD COLUMN activo INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_empleo_activo ON empleo(activo);

INSERT OR IGNORE INTO fuente_empleo (id, nombre, tipo, url, activa)
SELECT COALESCE((SELECT MAX(id) FROM fuente_empleo), 0) + 1,
       'Institucional',
       'manual',
       NULL,
       1
WHERE NOT EXISTS (SELECT 1 FROM fuente_empleo WHERE nombre = 'Institucional');
