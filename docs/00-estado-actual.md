# Estado actual del proyecto - Continental Oportunidades

## Estado general
El proyecto tiene arquitectura base, documentación canónica, frontend y backend operativos, worker con integración Remotive y persistencia real del módulo `empleos` en SQLite. **Fase 2.3 cerrada:** recolección Remotive operativa. **Fase 1 UI cerrada:** marketplace y detalle de oportunidades con design system institucional.

## Implementado actualmente
- estructura monorepo definida
- apps/web operativo con layout institucional (sidebar + header)
- apps/api operativo
- worker Remotive en `workers/recolector` (extraer → normalizar → deduplicar → SQLite)
- endpoint `GET /api/health` operativo
- endpoint `GET /api/empleos` operativo (filtros SQL, paginación, nombre de fuente)
- endpoint `GET /api/empleos/:id` operativo
- endpoint `GET /api/fuentes` operativo (lectura desde SQLite)
- persistencia real con SQLite en módulos `empleos` y `fuentes`
- UI marketplace `/empleos` con filtros (`q`, ubicación, modalidad, fuente) y paginación
- UI detalle `/empleos/:id` con enlace a oferta original
- `database/schema.sql` y `database/seeds.sql` operativos
- deduplicación worker por `url_oferta` + fuente Remotive

## Restricción técnica actual
- Módulos `perfil` y `recomendaciones` siguen como stub (Fase 2 del roadmap).
- Sin autenticación ni roles (Fase 3).
- Postulaciones, favoritos, admin y reportes pendientes (Fases 4–5).

## Reglas de acotación vigentes
- fuente externa integrada: **Remotive API** (primera fuente real)
- no scraping HTML en esta etapa
- no modificar lógica de `perfil` ni `recomendaciones` más allá de stubs existentes
- no añadir `auth` hasta Fase 3

## Condiciones de uso Remotive
- conservar el enlace original de la oferta
- registrar Remotive como fuente en `fuente_empleo`
- asumir retraso ~24 h de la API pública
- no redistribuir ofertas fuera de términos Remotive

## Siguiente paso: Fase 2
- Perfil real contra SQLite (`GET/PUT /api/perfil/me`)
- Motor de recomendación por reglas (`docs/08-motor-recomendacion.md`)
- UI dashboard estudiante con recomendados
