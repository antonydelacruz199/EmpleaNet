# Roadmap - EmpleaNet

## Completado
- Base monorepo y documentación canónica
- `apps/web` y `apps/api` operativos
- `GET /api/health`
- Módulo `empleos`: SQLite, filtros SQL, paginación, `modalidad`

## Fase 2.3 (siguiente) — Recolección real, una sola fuente
**Objetivo:** primera integración productiva del worker con **Remotive API** (única fuente inicial).

**Incluye:** extraer → normalizar → deduplicar → persistir en SQLite compartida con la API.

**Excluye explícitamente:**
- scraping HTML
- cualquier fuente que no sea Remotive
- múltiples fuentes o conectores en esta fase
- cambios en `perfil`, `recomendaciones` y `auth`

**Verificación:** los empleos aparecen en `GET /api/empleos` y en detalle.

## Fases posteriores (orden orientativo)
- Cierre visual del módulo `empleos` (UI)
- Módulo `perfil`
- Módulo `recomendaciones`
- Fuentes adicionales (tras Remotive)
- Endurecimiento y pruebas
