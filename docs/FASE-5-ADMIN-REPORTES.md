# Fase 5 — Administración y reportes institucionales

> Cierre documental de la Fase 5 del roadmap (`DEVELOPMENT_ROADMAP.md`).  
> **Bizagi:** O2 (registro manual de ofertas), O5 (reportes y exportación).  
> **Mockups:** `gesti_n_de_ofertas_*`, `dashboard_de_reportes_institucionales_*`

**Estado:** ✅ Cerrada  
**Rama de implementación:** `feature/fase-5-admin-reportes`  
**Commit:** `feat(fase-5): administracion de ofertas y reportes institucionales`

---

## 1. Objetivo

Habilitar al **administrador institucional** para:

1. Registrar y mantener ofertas laborales **manuales** (convenios, prácticas internas, etc.).
2. **Archivar** ofertas sin borrado físico (regla PP-04 / PO-05).
3. Consultar **indicadores de uso** de la plataforma y exportarlos en **CSV**.

---

## 2. Alcance implementado

### Backend (`apps/api/src/modules/admin/`)

| Funcionalidad | Endpoint | Rol |
|---------------|----------|-----|
| Listar ofertas (activas + archivadas) | `GET /api/admin/empleos` | administrador |
| Crear oferta manual | `POST /api/admin/empleos` | administrador |
| Actualizar oferta | `PUT /api/admin/empleos/:id` | administrador |
| Archivar / reactivar | `PATCH /api/admin/empleos/:id/activo` | administrador |
| Resumen de indicadores | `GET /api/admin/reportes/resumen` | administrador |
| Exportación CSV | `GET /api/admin/reportes/export.csv` | administrador |

### Frontend (`apps/web/src/modules/admin/`)

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/admin/ofertas` | `AdminOfertasPage` | Formulario alta/edición + tabla con archivar |
| `/admin/reportes` | `AdminReportesPage` | Tarjetas de indicadores + desglose por fuente + CSV |
| `/` (dashboard admin) | `InicioPage` | Resumen rápido + accesos directos |

### Base de datos

Migración: `database/migrations/005_admin_empleo_activo.sql`

- Columna `empleo.activo` (1 = visible en marketplace, 0 = archivada).
- Fuente `Institucional` (tipo `manual`) para ofertas creadas por admin.
- Índice `idx_empleo_activo`.

El listado público `GET /api/empleos` filtra `activo = 1`.

---

## 3. Modelo y reglas de negocio

| Regla | Implementación |
|-------|----------------|
| PO-05 — Cierre de ofertas | `PATCH …/activo` con `{ "activo": false }` |
| AD-01 — Solo admin gestiona ofertas manuales | Middleware `requireRoles("administrador")` |
| Fuente manual | Todas las ofertas creadas vía POST admin usan fuente `Institucional` |
| Sin DELETE físico | No hay endpoint DELETE; historial de postulaciones preservado |
| Reportes MVP (O5) | Conteos agregados; sin BI avanzado ni gráficos interactivos |

### Indicadores en `/api/admin/reportes/resumen`

```json
{
  "usuariosActivos": 4,
  "ofertasPublicadas": 31,
  "ofertasPorFuente": [
    { "fuente": "Remotive", "total": 28 },
    { "fuente": "Institucional", "total": 3 }
  ],
  "recomendacionesGeneradas": 120,
  "postulacionesRegistradas": 8,
  "favoritosGuardados": 5
}
```

---

## 4. Ejemplos de uso API

### Crear oferta institucional

```http
POST /api/admin/empleos
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "title": "Práctica preprofesional — TI",
  "company": "Universidad Continental",
  "location": "Lima",
  "modalidad": "hibrido",
  "descripcion": "Práctica en área de sistemas.",
  "urlOferta": "https://continental.edu.pe/practicas/ti",
  "salario": "Convenio institucional",
  "fechaPublicacion": "2026-07-03"
}
```

### Archivar oferta

```http
PATCH /api/admin/empleos/12/activo
Authorization: Bearer <token_admin>
Content-Type: application/json

{ "activo": false }
```

---

## 5. Verificación manual

**Usuario:** `admin@continental.edu.pe` · **Contraseña:** `Continental2026`

```bash
pnpm dev:api
pnpm dev:web
```

| # | Paso | Resultado esperado |
|---|------|-------------------|
| 1 | Login como administrador | Dashboard con panel admin e indicadores |
| 2 | Ir a `/admin/ofertas` | Formulario + tabla de ofertas |
| 3 | Publicar oferta manual | Aparece en tabla y en `/empleos` |
| 4 | Archivar la oferta | Desaparece del marketplace; sigue en panel admin |
| 5 | Ir a `/admin/reportes` | Tarjetas con conteos actualizados |
| 6 | Exportar CSV | Descarga `reportes-continental-oportunidades.csv` |
| 7 | Login como estudiante | Rutas `/admin/*` redirigen a inicio |

---

## 6. Exclusiones de Fase 5 (Fase 6 o futuro)

- Panel estratégico (`/admin/estrategico`) — Bizagi E3
- Validación workflow de ofertas importadas (aprobar/rechazar worker) — simplificado: importadas visibles directamente
- CRUD de usuarios admin
- Gráficos interactivos en reportes (solo tablas + CSV)
- Trazabilidad de auditoría de cambios admin (AD-02) — Fase 6

---

## 7. Archivos principales

| Área | Rutas |
|------|-------|
| API | `apps/api/src/modules/admin/*` |
| Migración | `database/migrations/005_admin_empleo_activo.sql` |
| Web | `apps/web/src/modules/admin/*` |
| Rutas | `apps/web/src/router.tsx` (bloque `administrador`) |
| Contratos | `docs/06-contratos-api.md` |
| Estado | `docs/00-estado-actual.md` |

---

## 8. Relación con plan de pruebas

El documento en `articulos/plan de pruebas/` debe incluir casos de prueba para:

- Alta/edición/archivado de ofertas manuales (O2)
- Visibilidad en marketplace según `activo`
- Indicadores y exportación CSV (O5)
- Control de acceso por rol en rutas `/admin/*`

Ver [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) · [`UI_FLOW.md`](UI_FLOW.md) · [`MODULES.md`](MODULES.md)
