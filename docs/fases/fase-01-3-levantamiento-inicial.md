# Fase 01.3 - Levantamiento inicial de frontend, backend y worker

## Estado
Completada

## Objetivo
Poner de pie la base técnica del sistema para que frontend, backend y worker existieran como piezas reales del proyecto antes de implementar funcionalidad de negocio.

## Problema que resuelve
Era necesario evitar que el proyecto siguiera siendo solo documentación o estructura vacía.  
Se necesitaba una base ejecutable para validar el entorno y empezar a construir módulos reales.

## Trabajo realizado

### Frontend
Se dejó creada la base de `apps/web` con:
- estructura principal
- cliente HTTP único
- layout principal
- router base
- módulos base

### Backend
Se dejó creada la base de `apps/api` con:
- estructura modular
- configuración
- seguridad
- middlewares
- módulos iniciales

### Worker
Se dejó creado `workers/recolector` con una estructura mínima preparada para crecer sin mezclarse con API ni frontend.

## Archivos importantes levantados
### Frontend
- `apps/web/src/core/http/clienteHttp.ts`
- `apps/web/src/layouts/LayoutPrincipal.tsx`
- `apps/web/src/router.tsx`
- `apps/web/src/modules/empleos/`
- `apps/web/src/modules/perfil/`
- `apps/web/src/modules/recomendaciones/`

### Backend
- `apps/api/src/config/env.ts`
- `apps/api/src/core/db/conexion.ts`
- `apps/api/src/core/middlewares/`
- `apps/api/src/core/security/setupSecurity.ts`
- `apps/api/src/modules/empleos/`
- `apps/api/src/modules/perfil/`
- `apps/api/src/modules/recomendaciones/`
- `apps/api/src/modules/fuentes/`
- `apps/api/src/app.ts`
- `apps/api/src/index.ts`

### Worker
- `workers/recolector/src/recolector/__main__.py`
- `workers/recolector/src/recolector/extractores.py`
- `workers/recolector/src/recolector/normalizadores.py`
- `workers/recolector/src/recolector/repositorio.py`

## Resultado de la fase
El proyecto dejó de ser una estructura teórica y pasó a tener una base técnica ejecutable y ordenada.

## Siguiente fase relacionada
`fase-02-1-persistencia-real-empleos-sqlite.md`