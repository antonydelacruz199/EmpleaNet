# Módulo O2 — Gestión de ofertas laborales y prácticas

Documentación del módulo de ofertas (Bizagi O2) en EmpleaNet / Continental Oportunidades.

## Objetivo

Gestionar el ciclo de vida completo de ofertas laborales y prácticas:

1. Crear oferta (borrador)
2. Editar y completar datos mínimos
3. Validar oferta
4. Clasificar (modalidad, categoría, tipo, habilidades)
5. Publicar en marketplace
6. Cerrar o archivar

Además: CRUD de **empresas** y **fuentes externas**.

## Reglas de negocio

| Regla | Implementación |
|-------|----------------|
| No publicar sin datos mínimos | `validarDatosMinimos()` en `ofertas.workflow.ts` |
| Empresa/fuente asociada | `fuenteId` obligatorio; `company` requerido |
| Estado obligatorio | Default `borrador` al crear |
| Fecha de cierre | Requerida para validar/publicar; debe ser ≥ hoy |
| Clasificación | Modalidad, categoría, tipo de oportunidad |
| Ofertas vencidas no activas | `syncOfertasVencidas()` + `SQL_OFERTA_PUBLICA` |

### Estados

```
borrador → pendiente_validacion → validada → publicada
                                      ↓           ↓
                                 rechazada     cerrada / archivada
```

### Datos mínimos para validar/publicar

- Título (≥ 3 caracteres)
- Empresa
- Fuente asociada
- Modalidad
- Categoría
- Tipo de oportunidad
- Fecha de cierre (hoy o posterior)
- Descripción (≥ 20 caracteres)

## Base de datos

Migración: `database/migrations/009_offers_module.sql`

| Tabla / columna | Descripción |
|-----------------|-------------|
| `empresa` | Catálogo de empresas |
| `empleo.estado` | Estado del workflow |
| `empleo.fecha_cierre` | Cierre de convocatoria |
| `empleo.categoria` | Categoría sectorial |
| `empleo.tipo_oportunidad` | empleo, práctica, convenio, freelance |
| `empleo.empresa_id` | FK opcional a `empresa` |
| `empleo.habilidades_requeridas` | CSV de skills |
| `empleo.validado_en` / `publicado_en` | Auditoría de fechas |

Runtime: `ensureOffersSchema()` en `apps/api/src/modules/ofertas/ensureOffersSchema.ts`

## API (admin, rol `administrador`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/admin/empleos/resumen` | KPIs por estado |
| GET | `/api/admin/empleos` | Listado con filtros |
| GET | `/api/admin/empleos/:id` | Detalle |
| POST | `/api/admin/empleos` | Crear (borrador) |
| PUT | `/api/admin/empleos/:id` | Actualizar |
| POST | `/api/admin/empleos/:id/validar` | Validar |
| POST | `/api/admin/empleos/:id/clasificar` | Clasificar |
| POST | `/api/admin/empleos/:id/publicar` | Publicar |
| POST | `/api/admin/empleos/:id/rechazar` | Rechazar |
| POST | `/api/admin/empleos/:id/cerrar` | Cerrar |
| PATCH | `/api/admin/empleos/:id/activo` | Archivar/reactivar |
| GET/POST/PUT | `/api/admin/empresas` | CRUD empresas |
| GET/POST/PUT | `/api/admin/fuentes` | CRUD fuentes |

### Filtros de listado admin

Query: `estado`, `modalidad`, `categoria`, `tipo`, `fuente`, `q`

### Marketplace público

`GET /api/empleos` aplica `SQL_OFERTA_PUBLICA`:

- `estado = 'publicada'`
- `activo = 1`
- `fecha_cierre IS NULL OR fecha_cierre >= hoy`

Filtros adicionales: `categoria`, `tipo`, `modalidad`, `fuente`.

## Frontend

| Ruta | Pantalla |
|------|----------|
| `/admin/ofertas` | Panel O2: KPIs, CRUD, workflow |
| `/admin/empresas` | Gestión de empresas |
| `/admin/fuentes` | Gestión de fuentes |

Archivos principales:

- `apps/web/src/modules/admin/AdminOfertasPage.tsx`
- `apps/web/src/modules/admin/AdminEmpresasPage.tsx`
- `apps/web/src/modules/admin/AdminFuentesPage.tsx`
- `apps/web/src/modules/admin/api.ts`

## Tests

```bash
pnpm --filter @empleanet/api test
```

Cobertura:

- `ofertas.workflow.test.ts` — validación de datos mínimos y transiciones
- `ofertas.test.ts` — creación, publicación, cierre por fecha, filtros

## Estructura backend

```
apps/api/src/modules/ofertas/
  ensureOffersSchema.ts   # migración runtime + sync vencidas
  ofertas.schema.ts       # Zod + tipos
  ofertas.workflow.ts     # reglas de negocio
  ofertas.repository.ts   # persistencia
  ofertas.service.ts        # orquestación + auditoría
```

El `AdminService` delega en `OfertasService` para no duplicar lógica.

## Flujo recomendado (admin)

1. Registrar empresa/fuente si no existen
2. Crear oferta → estado `borrador`
3. Completar todos los campos mínimos
4. **Validar** → `validada`
5. **Clasificar** (habilidades requeridas)
6. **Publicar** → visible en `/empleos`
7. **Cerrar** manualmente o automático al vencer `fecha_cierre`
