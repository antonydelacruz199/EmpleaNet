# Estado actual del proyecto - EmpleaNet

## Estado general
El proyecto ya tiene arquitectura base, documentación canónica, frontend y backend operativos, worker base y persistencia real del módulo `empleos` en SQLite.

## Implementado actualmente
- estructura monorepo definida
- apps/web operativo
- apps/api operativo
- worker base creado en `workers/recolector`
- endpoint `GET /api/health` operativo
- endpoint `GET /api/empleos` operativo
- endpoint `GET /api/empleos/:id` operativo
- persistencia real con SQLite en el módulo `empleos`
- filtros SQL en `/api/empleos`
- paginación básica en `/api/empleos`
- `database/schema.sql` y `database/seeds.sql` operativos

## Restricción técnica actual
- El cierre **visual** del módulo `empleos` en frontend aún no está hecho.
- **Fase 2.3 (siguiente):** primera recolección real; fuente **única** = **Remotive API**; sin scraping; sin otras fuentes; sin tocar `perfil`, `recomendaciones` ni `auth`.

## Reglas de acotación de la Fase 2.3
- una sola fuente: **Remotive API** (ninguna otra; ningún conector múltiple aún)
- **no** scraping HTML
- no modificar módulos `perfil` ni `recomendaciones`, ni añadir `auth`
- prioridad: que el worker persista ofertas legibles luego vía `GET /api/empleos`

## Condiciones de uso a respetar en la integración inicial
La integración con Remotive debe:
- conservar el enlace original de la oferta
- registrar a Remotive como fuente
- considerar que la API pública muestra empleos con retraso de 24 horas
- no reutilizar esta integración para redistribuir empleos a terceros no permitidos por sus términos

## Siguiente paso: Fase 2.3
- Worker: Remotive → normalizar → deduplicar → SQLite (misma base que `apps/api`)
- Verificación: empleos visibles en `GET /api/empleos` y detalle