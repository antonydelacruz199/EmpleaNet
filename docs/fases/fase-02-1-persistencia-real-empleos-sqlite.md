# Fase 02.1 - Persistencia real del módulo empleos con SQLite

## Estado
Completada

## Objetivo
Reemplazar los datos simulados del módulo `empleos` por persistencia real en SQLite, manteniendo una arquitectura simple y limpia.

## Problema que resuelve
Antes de esta fase, `empleos.repository.ts` todavía trabajaba con datos simulados o arreglos en memoria.  
Eso impedía avanzar correctamente hacia:
- filtros reales
- detalle estable
- perfil
- recomendaciones
- recolección real

## Contexto previo
El proyecto ya tenía:
- backend operativo
- frontend operativo
- health check
- módulo `empleos` básico
- `schema.sql` y `seeds.sql`

Pero aún faltaba conectar todo eso a una base real.

## Trabajo realizado

### 1. Conexión real a SQLite
Se implementó la conexión real en:

`apps/api/src/core/db/conexion.ts`

#### Logros
- uso de `better-sqlite3`
- singleton mediante `getDb()`
- creación automática del directorio del archivo `.db`
- activación de `PRAGMA foreign_keys = ON`
- inicialización de `schema.sql`
- carga de `seeds.sql` en desarrollo si la tabla `empleo` está vacía

### 2. Base de datos inicial
Se consolidaron los archivos:

- `database/schema.sql`
- `database/seeds.sql`

#### Tablas creadas
- `fuente_empleo`
- `empleo`
- `perfil`
- `recomendacion`

#### Mejoras aplicadas
- seeds idempotentes con `INSERT OR IGNORE`
- transacción en el seed
- índices básicos en `schema.sql`
- índice único para `(perfil_id, empleo_id)`

### 3. Repository del módulo empleos
Se reescribió:

`apps/api/src/modules/empleos/empleos.repository.ts`

#### Logros
- eliminación de mocks
- uso de `SELECT` reales sobre SQLite
- mapeo de columnas SQL al contrato del API
- validación del id en `findById`

### 4. Seguridad y estabilidad
Se corrigieron problemas importantes:
- resolución correcta de rutas SQLite absolutas y relativas
- mejora de configuración CORS
- apertura controlada de la DB al arrancar la API

## Endpoints funcionales cerrados
- `GET /api/health`
- `GET /api/empleos`
- `GET /api/empleos/:id`

## Validaciones realizadas
Se verificó que:
- la API levanta correctamente
- `/api/health` responde correctamente
- `/api/empleos` devuelve registros desde SQLite
- los datos coinciden con `seeds.sql`
- build del proyecto OK
- lint OK

## Resultado de la fase
El módulo `empleos` dejó de depender de datos simulados y pasó a operar con persistencia real en SQLite.

## Limitaciones actuales al cierre de la fase
Aunque la persistencia backend ya está resuelta, todavía falta:
- cerrar el detalle real en frontend
- implementar filtros reales
- avanzar luego a perfil y recomendaciones

## Archivos involucrados
- `apps/api/src/core/db/conexion.ts`
- `apps/api/src/app.ts`
- `apps/api/src/modules/empleos/empleos.repository.ts`
- `apps/api/src/modules/empleos/empleos.service.ts`
- `apps/api/src/modules/empleos/empleos.schema.ts`
- `database/schema.sql`
- `database/seeds.sql`
- `.gitignore`
- `docs/00-estado-actual.md`
- `docs/03-arquitectura.md`
- `docs/06-contratos-api.md`
- `docs/10-roadmap.md`
- `.cursor/rules/architecture.mdc`

## Siguiente fase relacionada
`fase-02-2-detalle-empleo-frontend.md`