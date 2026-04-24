# Contratos API - EmpleaNet

## Convenciones
- prefijo base: `/api`
- respuestas en JSON
- mensajes de error controlados
- validación de entrada obligatoria
- no documentar como implementado lo que todavía sigue pendiente

## Estado actual
La API expone el módulo de empleos con persistencia en SQLite: `GET /api/empleos` y `GET /api/empleos/:id` leen desde la base de datos.

## Endpoints implementados actualmente

### GET /api/health
Verifica que la API está operativa.

Respuesta esperada:
```json
{
  "status": "ok"
}