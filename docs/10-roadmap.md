# Roadmap - EmpleaNet

## Completado
- Base monorepo y documentación canónica
- `apps/web` y `apps/api` operativos
- `GET /api/health`
- Módulo `empleos`: SQLite, filtros SQL, paginación, `modalidad`

## Fase 2.3 — Recolección real, una sola fuente ✅
**Objetivo cumplido:** integración del worker con **Remotive API** (única fuente inicial).

**Incluye:** extraer → normalizar → deduplicar → persistir en SQLite compartida con la API.

**Verificación:** ofertas visibles en `GET /api/empleos`, detalle y UI `/empleos`.

## Fase 1 UI — Empleos end-to-end ✅
Marketplace con filtros, paginación, detalle y design system institucional.

## Fase 2 (siguiente) — Perfil y recomendaciones
- Módulo `recomendaciones`
- Fuentes adicionales (tras Remotive)
- Endurecimiento y pruebas
