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
- persistencia del módulo empleos con SQLite (`better-sqlite3`, `database/schema.sql`, `database/seeds.sql`, inicialización en desarrollo)

## Restricción técnica actual
Ninguna bloqueante para avanzar a filtros reales en API o detalle de empleo en frontend.

## No implementado todavía
- filtros reales en GET /api/empleos (más allá del filtro en memoria sobre resultados cargados)
- detalle completo de empleo en frontend con ruta dedicada
- módulo perfil funcional
- módulo recomendaciones funcional
- recolección real desde una fuente web externa
- deduplicación real de empleos recolectados
- autenticación
- pruebas automatizadas completas

## Regla de avance actual
Puede avanzarse a filtros SQL y detalle de empleo en frontend según roadmap; perfil y recomendaciones siguen pendientes de diseño de producto.

## Siguiente paso sugerido
- filtros básicos en SQL para GET /api/empleos
- pantalla de detalle de empleo en frontend