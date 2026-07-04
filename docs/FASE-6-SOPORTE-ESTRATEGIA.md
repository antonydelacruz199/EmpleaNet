# Fase 6 — Soporte, estrategia y endurecimiento

> Cierre documental de la Fase 6 (última del roadmap PROMPT 0).  
> **Bizagi:** S2, S4, E3 | **Mockups:** config. motor, panel estratégico

**Estado:** ✅ Cerrada

---

## 1. Objetivo

Completar capacidades de **soporte técnico**, **análisis estratégico** y **endurecimiento operativo** del MVP académico.

---

## 2. Alcance implementado

### Soporte (`/soporte/*`, rol `soporte`)

| Funcionalidad | Ruta API | UI |
|---------------|----------|-----|
| Configuración ponderaciones motor | `GET/PUT /api/soporte/motor/config` | `/soporte/motor` |
| Recálculo global recomendaciones | `POST /api/soporte/motor/recalcular` | botón en motor |
| Incidencias técnicas | `GET/POST /api/soporte/incidencias` | `/soporte/incidencias` |
| Cambio estado incidencia | `PATCH /api/soporte/incidencias/:id/estado` | select en tabla |
| Auditoría básica | `GET /api/soporte/auditoria` | tabla en incidencias |

### Administración estratégica (rol `administrador`)

| Funcionalidad | Ruta API | UI |
|---------------|----------|-----|
| Panel estratégico agregado | `GET /api/admin/estrategico/resumen` | `/admin/estrategico` |

Indicadores adicionales: usuarios por rol, postulaciones por estado, ofertas por modalidad, puntaje promedio, tasa postulación/oferta, incidencias abiertas.

### Base de datos

Migración `006_fase6_soporte_estrategia.sql`:
- `motor_config` — ponderaciones editables (suma = 100)
- `auditoria` — logs append-only
- `incidencia` — registro S4 básico

### Endurecimiento

| Entregable | Ubicación |
|------------|-----------|
| Script respaldo SQLite | `scripts/backup-sqlite.ps1`, `scripts/backup-sqlite.sh` |
| Pruebas de humo API | `scripts/smoke-test.mjs` (`pnpm smoke`) |
| Evaluación 2.ª fuente (doc) | `docs/EVALUACION-SEGUNDA-FUENTE.md` |

### Auditoría automática

Eventos registrados: `login_exitoso`, `empleo_creado/actualizado/archivado/reactivado`, `motor_config_actualizada`, `motor_recalculo_global`, `incidencia_registrada`.

---

## 3. Verificación manual

**Soporte:** `soporte@continental.edu.pe` / `Continental2026`

1. `/soporte/motor` — ajustar ponderaciones (total 100) → guardar → recalcular.
2. `/soporte/incidencias` — registrar incidencia → cambiar estado → ver auditoría.

**Admin:** `admin@continental.edu.pe` / `Continental2026`

3. `/admin/estrategico` — revisar indicadores agregados.

**Scripts:**

```bash
pnpm dev:api
pnpm smoke
.\scripts\backup-sqlite.ps1
```

---

## 4. Roadmap completo

Con Fase 6 cerrada, el roadmap del PROMPT 0 (F0–F6) queda **100 % implementado** en código y documentación.

---

Ver también: [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) · [`EVALUACION-SEGUNDA-FUENTE.md`](EVALUACION-SEGUNDA-FUENTE.md)
