# Roadmap - EmpleaNet

## Regla general
Construir por fases pequeñas y verificables.  
No avanzar a la siguiente fase dejando deuda importante en la anterior.

## Estado actual del proyecto

### Completado
- estructura del monorepo definida
- documentación canónica creada
- reglas de Cursor creadas
- frontend base operativo
- backend base operativo
- worker base creado
- endpoint `GET /api/health` operativo
- endpoint `GET /api/empleos` operativo
- endpoint `GET /api/empleos/:id` operativo
- `database/schema.sql` creado
- `database/seeds.sql` creado
- `EmpleosPage.tsx` consumiendo datos desde la API

### Restricción actual
Ninguna bloqueante respecto a persistencia de empleos: SQLite ya está conectado.

## Paso actual sugerido
Cerrar filtros básicos en SQL para `GET /api/empleos` y la pantalla de detalle de empleo en el frontend.

## Fase 1 - Base del proyecto
- definir estructura del monorepo
- definir documentación canónica
- preparar frontend base
- preparar backend base
- preparar worker base

Estado:
- completada

## Fase 2 - Persistencia real y módulo de empleos
- conectar SQLite
- dejar `empleos.repository.ts` leyendo desde base de datos
- validar listado de empleos desde persistencia real
- validar detalle de empleo desde persistencia real
- implementar filtros básicos reales en `/api/empleos`
- cerrar detalle de empleo en frontend

Estado:
- en progreso

## Fase 3 - Perfil
- crear perfil
- editar perfil
- exponer datos necesarios para recomendación

Estado:
- pendiente

## Fase 4 - Recomendación
- implementar cálculo por reglas
- exponer endpoint de recomendaciones
- mostrar recomendaciones en frontend

Estado:
- pendiente

## Fase 5 - Recolección
- implementar extractor inicial real
- normalización real
- deduplicación real
- persistencia desde el worker

Estado:
- pendiente

## Fase 6 - Endurecimiento
- seguridad base completa
- revisión de errores
- pruebas iniciales
- mejora de rendimiento

Estado:
- pendiente

## Orden obligatorio de avance
1. persistencia real del módulo empleos
2. filtros y detalle de empleo
3. perfil
4. recomendaciones
5. recolección real
6. endurecimiento y pruebas