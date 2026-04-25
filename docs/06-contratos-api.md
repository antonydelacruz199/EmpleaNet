# Contratos API - EmpleaNet

## Convenciones
- prefijo base: `/api`
- respuestas en JSON
- mensajes de error controlados
- validación de entrada obligatoria
- no documentar como implementado lo que aún no exista

## Estado actual
La API expone el módulo `empleos` con persistencia en SQLite. Los empleos que en **Fase 2.3** ingresen vía el worker (Remotive) deberán cumplir el mismo modelo; **no se exigen** nuevos endpoints públicos en 2.3 para ingerir: la ingesta es vía worker sobre SQLite (compartida con la API).

## Endpoints: módulo empleos (implementados)

### GET /api/health
Operatividad de la API.

```json
{
  "status": "ok"
}
```

### GET /api/empleos
Listado paginado. Query (todos opcionales; valores por defecto en servidor):

| Parámetro  | Descripción |
|------------|-------------|
| `q`        | Título, empresa, descripción (insensible a mayúsculas) |
| `ubicacion`| Parcial; alias `location` |
| `modalidad`| Coincidencia exacta (p. ej. `remoto`, `presencial`, `hibrido`) |
| `fuente`   | ID de `fuente_empleo` o texto: nombre de fuente (parcial) |
| `page`     | ≥ 1, por defecto 1 |
| `limit`    | 1…100, por defecto 20 |

**Respuesta:**
```json
{
  "empleos": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

Tras 2.3, al poblar con Remotive, `fuente` podrá filtrar por el registro de fuente “Remotive” u otro creado en catálogo.

### GET /api/empleos/:id
Detalle de un empleo por `id` numérico. Incluye `modalidad` y demás campos persistidos.
