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
Detalle de un empleo por `id` numérico. Incluye `modalidad`, `fuenteNombre` y demás campos persistidos.

## Endpoints: módulo perfil (implementados)

### GET /api/perfil/me
Requiere JWT. Rol: `estudiante` o `egresado`. Devuelve el perfil del usuario autenticado.

### PUT /api/perfil/me
Requiere JWT. Rol: `estudiante` o `egresado`. Recalcula recomendaciones automáticamente.

```json
{
  "name": "Estudiante Continental",
  "location": "Remoto",
  "skills": ["typescript", "react", "nodejs"]
}
```

## Endpoints: módulo recomendaciones (implementados)

### GET /api/recomendaciones
Requiere JWT. Rol: `estudiante` o `egresado`. Lista ordenada por `puntaje` descendente. Query opcional: `limit` (1–50, default 20).

```json
{
  "recomendaciones": [
    {
      "puntaje": 72.5,
      "motivo": "Habilidades: react, typescript. Modalidad remota alineada.",
      "empleo": { "id": "1", "title": "..." }
    }
  ]
}
```

## Endpoints: autenticación (implementados)

Ver detalle en [`AUTH_MODULE.md`](AUTH_MODULE.md).

### POST /api/auth/login
```json
{ "email": "estudiante@continental.edu.pe", "password": "Continental2026" }
```
Respuesta: `{ "token", "user": { "id", "email", "rol", "name", "perfilId", "perfilCompleto" } }`

### POST /api/auth/register
Roles permitidos: `estudiante`, `egresado`, `empresa`. Contraseña segura (8+ chars, mayúscula, minúscula, número).

### POST /api/auth/forgot-password
```json
{ "email": "usuario@continental.edu.pe" }
```

### POST /api/auth/reset-password
```json
{ "token": "...", "password": "...", "confirmPassword": "..." }
```

### GET /api/auth/me
Header: `Authorization: Bearer <token>`

### POST /api/auth/logout
Header: `Authorization: Bearer <token>`. Respuesta `204`.

## Endpoints: módulo postulaciones (implementados)

Requieren JWT. Rol: `estudiante` o `egresado`.

### GET /api/postulaciones
Historial del perfil autenticado, ordenado por fecha descendente.

### GET /api/postulaciones/resumen
```json
{ "activas": 0 }
```
Cuenta postulaciones con estado `registrada` o `en_proceso`.

### GET /api/postulaciones/empleo/:empleoId
```json
{ "postulado": true, "postulacion": { "id", "empleoId", "estado", "fechaPostulacion" } }
```

### POST /api/postulaciones
Registra postulación. Requiere perfil con al menos una habilidad (PP-02).

```json
{ "empleoId": "1" }
```

Respuesta `201`: `{ "postulacion": { ... }, "urlOferta": "https://..." }`

## Endpoints: módulo favoritos (implementados)

Requieren JWT. Rol: `estudiante` o `egresado`.

### GET /api/favoritos
Listado de ofertas guardadas.

### GET /api/favoritos/empleo/:empleoId
```json
{ "esFavorito": false }
```

### POST /api/favoritos
```json
{ "empleoId": "1" }
```

### DELETE /api/favoritos/:empleoId
Quita favorito. Respuesta `204`.

## Endpoints: módulo seguimiento (implementados)

Requieren JWT. Rol: `estudiante` o `egresado`.

### GET /api/seguimiento/resumen
Contadores de postulaciones, activas, favoritos y vistas.

### GET /api/seguimiento/vistas
Historial de oportunidades consultadas en detalle.

### POST /api/seguimiento/vistas
Registra o actualiza vista `{ "empleoId": "1" }`. Respuesta `201`: `{ "vista": { ... } }`.

## Endpoints: módulo admin (implementados)

Requieren JWT. Rol: `administrador`.

### GET /api/admin/empleos
Listado completo (activas y archivadas) para gestión.

### POST /api/admin/empleos
Crea oferta manual con fuente `Institucional`.

### PUT /api/admin/empleos/:id
Actualiza campos de la oferta.

### PATCH /api/admin/empleos/:id/activo
```json
{ "activo": false }
```
Archivado lógico: `activo=false` oculta la oferta del marketplace.

### GET /api/admin/reportes/resumen
Indicadores: usuarios activos, ofertas, recomendaciones, postulaciones, favoritos y desglose por fuente.

### GET /api/admin/reportes/export.csv
Descarga CSV con los mismos indicadores.

### GET /api/admin/estrategico/resumen
Indicadores agregados para panel estratégico (E3).

## Endpoints: módulo soporte (implementados)

Requieren JWT. Rol: `soporte`.

### GET /api/soporte/motor/config
Ponderaciones actuales del motor (suma = 100).

### PUT /api/soporte/motor/config
Actualiza ponderaciones. Recalcular recomendaciones aparte.

### POST /api/soporte/motor/recalcular
Recalcula recomendaciones para todos los perfiles.

### GET /api/soporte/incidencias
Listado de incidencias técnicas.

### POST /api/soporte/incidencias
```json
{ "titulo": "Error en login", "descripcion": "..." }
```

### PATCH /api/soporte/incidencias/:id/estado
```json
{ "estado": "en_proceso" }
```

### GET /api/soporte/auditoria
Últimos registros de auditoría (`?limit=50`).
