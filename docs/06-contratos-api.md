# Contratos API - EmpleaNet

## Convenciones
- prefijo base: `/api`
- respuestas en JSON
- mensajes de error controlados
- validación de entrada obligatoria
- no documentar como implementado lo que todavía sigue pendiente

## Estado actual
Actualmente la API ya expone un primer flujo funcional básico del módulo de empleos, pero todavía no tiene persistencia real conectada.  
Por ahora, `empleos.repository.ts` sigue usando datos simulados o arreglos en memoria.

## Endpoints implementados actualmente

### GET /api/health
Verifica que la API está operativa.

Respuesta esperada:
```json
{
  "status": "ok"
}