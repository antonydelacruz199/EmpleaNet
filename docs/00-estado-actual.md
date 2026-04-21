# Estado actual del proyecto - EmpleaNet

## Estado general
El proyecto ya tiene arquitectura base, documentación canónica, reglas de Cursor, frontend y backend ejecutables.

## Implementado actualmente
- estructura monorepo definida
- apps/web operativo
- apps/api operativo
- worker base creado en workers/recolector
- endpoint GET /api/health operativo
- endpoint GET /api/empleos operativo
- endpoint GET /api/empleos/:id operativo
- database/schema.sql creado
- database/seeds.sql creado
- EmpleosPage.tsx consume listado desde la API
- cliente HTTP único en frontend
- seguridad base centralizada en backend
- documentación base del proyecto creada

## Restricción técnica actual
Actualmente `apps/api/src/modules/empleos/empleos.repository.ts` todavía devuelve datos simulados o arreglos en memoria.

## No implementado todavía
- persistencia real del módulo empleos con SQLite
- filtros reales en GET /api/empleos
- detalle completo de empleo en frontend con ruta dedicada
- módulo perfil funcional
- módulo recomendaciones funcional
- recolección real desde una fuente web externa
- deduplicación real de empleos recolectados
- autenticación
- pruebas automatizadas completas

## Regla de avance actual
No avanzar a perfil ni recomendaciones hasta reemplazar los mocks de `empleos.repository.ts` por persistencia real con SQLite.

## Siguiente paso obligatorio
Conectar:
- `apps/api/src/core/db/conexion.ts`
- `database/schema.sql`
- `database/seeds.sql`
- `apps/api/src/modules/empleos/empleos.repository.ts`

Objetivo:
que GET /api/empleos y GET /api/empleos/:id lean desde SQLite y no desde datos simulados.