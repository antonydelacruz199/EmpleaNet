# Módulo O5 / E3 — Administración, reportes y panel estratégico

Documentación del módulo administrativo de EmpleaNet / Continental Oportunidades.

## Objetivo

Habilitar al **administrador institucional** para:

1. Consultar un **dashboard** con KPIs del sistema
2. Generar **reportes** de usuarios, ofertas, recomendaciones y postulaciones
3. Filtrar por **rango de fechas** y **estado**
4. **Exportar** indicadores en CSV o JSON
5. Analizar métricas en el **panel estratégico** (E3) con incidencias y mejoras sugeridas

## Control de acceso

Todos los endpoints bajo `/api/admin/*` requieren:

- JWT válido
- Rol `administrador`

Estudiantes, egresados, empresa y soporte reciben HTTP 403.

## Backend

Módulo: `apps/api/src/modules/admin/`

### KPIs y resumen

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/reportes/resumen` | Conteos agregados |
| GET | `/api/admin/reportes/kpis` | KPIs + tasas derivadas |

Query común (opcional):

| Parámetro | Formato | Uso |
|-----------|---------|-----|
| `fechaDesde` | `YYYY-MM-DD` | Filtro inferior inclusive |
| `fechaHasta` | `YYYY-MM-DD` | Filtro superior inclusive |
| `estado` | texto | Contextual por reporte |
| `rol` | enum rol | Solo reporte usuarios |

### Reportes detallados (tablas, máx. 100 filas)

| Método | Ruta | Filtro `estado` |
|--------|------|-----------------|
| GET | `/api/admin/reportes/usuarios` | `activo` / `inactivo` |
| GET | `/api/admin/reportes/ofertas` | estado workflow (`publicada`, `borrador`, …) |
| GET | `/api/admin/reportes/recomendaciones` | — |
| GET | `/api/admin/reportes/postulaciones` | `registrada`, `en_proceso`, `cerrada` |

### Exportación

| Método | Ruta | Formato |
|--------|------|---------|
| GET | `/api/admin/reportes/export.csv` | CSV indicadores + fuentes |
| GET | `/api/admin/reportes/export.json` | JSON con KPIs y tablas |

### Panel estratégico

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/estrategico/resumen` | Métricas agregadas, incidencias recientes, mejoras sugeridas |

Respuesta incluye:

- Desglose por rol, modalidad y estado de postulación
- Puntaje promedio de recomendaciones
- Tasa postulaciones / oferta activa
- `incidenciasRecientes` (hasta 5 abiertas/en proceso)
- `mejorasSugeridas` (reglas heurísticas sobre KPIs)

## KPIs calculados

| KPI | Cálculo |
|-----|---------|
| Usuarios activos | `usuario.activo = 1` (+ filtros) |
| Ofertas publicadas | `SQL_OFERTA_PUBLICA` (+ filtros fecha/estado) |
| Postulaciones activas | estado ∈ `registrada`, `en_proceso` |
| Tasa perfil completo | perfiles completos / usuarios activos × 100 |
| Tasa postulación/oferta | postulaciones / ofertas publicadas |
| Puntaje promedio | `AVG(recomendacion.puntaje)` |

## Frontend

| Ruta | Componente | Función |
|------|------------|---------|
| `/admin/dashboard` | `AdminDashboardPage` | KPIs, pipeline ofertas, accesos, acciones sugeridas |
| `/admin/reportes` | `AdminReportesPage` | Pestañas KPIs/usuarios/ofertas/recomendaciones/postulaciones, filtros, gráficos, export |
| `/admin/estrategico` | `AdminEstrategicoPage` | Gráficos, tablas, incidencias, mejoras |
| `/` (admin) | `InicioPage` | Resumen rápido + enlaces |

Componentes compartidos:

- `BarChartSimple` — barras CSS sin librerías externas
- `ReportesFiltrosForm` — fechas, rol, estado

## Tests

Archivo: `apps/api/src/modules/admin/admin.test.ts`

| Caso | Verificación |
|------|--------------|
| Acceso restringido | Estudiante → 403 en `/reportes/kpis` |
| Acceso admin | Administrador → 200 |
| KPIs coherentes | Tasas calculadas correctamente |
| Filtros | Reporte usuarios por rol |
| Exportación CSV | Contiene encabezados esperados |
| Exportación JSON | Incluye `kpis`, `usuarios`, `generadoEn` |
| Panel estratégico | `mejorasSugeridas` no vacío |

```bash
cd apps/api && pnpm test
```

## Reglas

- Los filtros de fecha usan la columna relevante por entidad (`creado_en`, `fecha_postulacion`, etc.).
- Los conteos reflejan datos reales en SQLite; no hay caché ni mocks.
- Exportaciones respetan los mismos filtros query que los reportes en pantalla.

## Relación con fases anteriores

- **O2:** gestión de ofertas (`/admin/ofertas`)
- **O4:** postulaciones y favoritos alimentan reportes
- **O3:** recomendaciones en KPIs y tablas
- **Fase 6:** incidencias de soporte visibles en panel estratégico
