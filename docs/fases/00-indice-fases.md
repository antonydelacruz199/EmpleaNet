# Índice de fases - EmpleaNet

## Propósito
Este documento sirve como mapa general de las fases del proyecto EmpleaNet.  
Su objetivo es mostrar qué fases ya fueron completadas, cuáles están en progreso y cuáles siguen pendientes.

## Estado general actual
El proyecto ya cuenta con:
- arquitectura base definida
- documentación canónica
- reglas de Cursor
- frontend y backend operativos
- worker base creado
- módulo `empleos` conectado a SQLite real
- endpoints funcionales:
  - `GET /api/health`
  - `GET /api/empleos`
  - `GET /api/empleos/:id`

## Fases registradas

| Fase | Nombre | Estado |
|------|--------|--------|
| 00 | Definición del proyecto | Completada |
| 01 | Base de arquitectura | Completada |
| 01.1 | Documentación canónica | Completada |
| 01.2 | Reglas de Cursor | Completada |
| 01.3 | Levantamiento inicial | Completada |
| 02.1 | Persistencia real de empleos con SQLite | Completada |
| 02.2 | Detalle real de empleo en frontend | Pendiente |
| 02.3 | Filtros reales de empleos | Pendiente |
| 03 | Módulo perfil | Pendiente |
| 04 | Módulo recomendaciones | Pendiente |
| 05 | Recolector real | Pendiente |
| 06 | Endurecimiento, pruebas y mejoras | Pendiente |

## Relación con el roadmap
Las fases detalladas de esta carpeta complementan:
- `docs/00-estado-actual.md`
- `docs/10-roadmap.md`

## Regla de uso
- las fases completadas sirven como memoria técnica e histórica del proyecto
- la fase actual debe alinearse siempre con `docs/00-estado-actual.md`
- no se debe tratar una fase pendiente como implementada