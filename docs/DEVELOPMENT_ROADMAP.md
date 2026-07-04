# Roadmap de desarrollo — Continental Oportunidades

> Plan de implementación técnico derivado de la [auditoría inicial](IMPLEMENTATION_AUDIT.md), alineado con procesos Bizagi (`/bizagi`), mockups (`/mockups`) y documentación canónica (`docs/01`–`10`).

**Principio rector:** evolución por fases sin cambiar stack ni sobreingenierizar. Cada fase cierra un entregable verificable antes de abrir la siguiente.

---

## Visión de fases

```mermaid
gantt
    title Roadmap Continental Oportunidades
    dateFormat YYYY-MM
    section Alta
    F0 Documentación base     :f0, 2026-07, 1w
    F1 Empleos end-to-end     :f1, after f0, 3w
    F2 Perfil y recomendación :f2, after f1, 3w
    F3 Auth y roles           :f3, after f2, 2w
    section Media
    F4 Postulaciones/favoritos:f4, after f3, 2w
    F5 Admin y reportes       :f5, after f4, 3w
    section Baja
    F6 Soporte y estrategia   :f6, after f5, 2w
```

---

## Fase 0 — Documentación y alineación

**Objetivo:** Base documental única para desarrollo coherente con la tesis.

| Entregable | Estado |
|------------|--------|
| `IMPLEMENTATION_AUDIT.md` | ✅ |
| `DEVELOPMENT_ROADMAP.md` | ✅ |
| `PROJECT_CONTEXT.md`, `SYSTEM_RULES.md`, `MODULES.md`, `UI_FLOW.md`, `DB_RULES.md` | En rama `feature/base-documental-desarrollo` |
| README actualizado | ✅ |

**Criterio de cierre:** equipo puede identificar qué está implementado vs pendiente sin leer código.

---

## Fase 1 — Recolección real y empleos end-to-end

**Prioridad:** 🔴 Alta  
**Bizagi:** O2, S5 | **Mockups:** marketplace, detalle de oportunidad

### Backend / worker
- [x] Ejecutar worker Remotive y verificar datos en `database/empleanet.db`
- [x] Confirmar deduplicación por `url_oferta`
- [x] Registrar fuente "Remotive" en `fuente_empleo`
- [x] Actualizar `docs/00-estado-actual.md` al cerrar 2.3

### Frontend
- [x] Aplicar design system (`mockups/continental_oportunidades_design_system/DESIGN.md`)
- [x] Pantalla marketplace: listado + filtros (`q`, ubicación, modalidad, fuente) + paginación
- [x] Pantalla detalle `/empleos/:id` con enlace a oferta original
- [x] Layout sidebar + header según mockups

### Verificación
```bash
python -m recolector
curl "http://localhost:4000/api/empleos?fuente=Remotive"
# Navegar /empleos y /empleos/:id con datos reales
```

**Exclusiones:** no tocar perfil, recomendaciones ni auth.

---

## Fase 2 — Perfil y motor de recomendación ✅

**Prioridad:** 🔴 Alta  
**Bizagi:** O1 (perfil), O3, S2 | **Mockups:** dashboard estudiante

### Backend
- [x] `GET/PUT /api/perfil/me` contra tabla `perfil`
- [x] Motor por reglas (`docs/08-motor-recomendacion.md`): habilidades, modalidad, ubicación, actualidad
- [x] Persistir scores en `recomendacion` (índice único perfil+empleo)
- [x] `GET /api/recomendaciones` con puntaje y motivo

### Frontend
- [x] Formulario perfil (habilidades, ubicación)
- [x] Sección recomendados en dashboard estudiante
- [x] Ordenamiento por relevancia (O3)

### Verificación
Perfil editado → recomendaciones distintas → motivo visible en UI.

---

## Fase 3 — Autenticación y roles ✅

**Prioridad:** 🔴 Alta  
**Bizagi:** O1, S3 | **Mockup:** inicio de sesión

### Alcance MVP auth
- [x] Roles: `estudiante`, `egresado`, `administrador`, `soporte`
- [x] Login/logout; protección de rutas
- [x] Tabla `usuario` + JWT (HS256, `node:crypto`)
- [x] Pantalla login según mockup

## Fase 4 — Postulaciones y favoritos ✅

**Prioridad:** 🟡 Media  
**Bizagi:** O4

### Backend
- [x] Tablas `postulacion`, `favorito`
- [x] Endpoints: registrar postulación, listar historial, guardar/quitar favorito
- [x] Redirección a `url_oferta` externa (no postulación automática)

### Frontend
- [x] Acciones en detalle: postular / guardar
- [x] Seguimiento de estado en dashboard estudiante

---

## Fase 5 — Administración y reportes ✅

**Prioridad:** 🟡 Media  
**Bizagi:** O2 (manual), O5 | **Mockups:** gestión ofertas, dashboard reportes

### Backend
- [x] CRUD ofertas manuales (admin)
- [x] Endpoints reportes: conteos usuarios, ofertas, recomendaciones, postulaciones
- [x] Columna `empleo.activo` para archivado lógico

### Frontend
- [x] Panel gestión ofertas (`/admin/ofertas`)
- [x] Dashboard reportes con exportación CSV (`/admin/reportes`)

---

## Fase 6 — Soporte, estrategia y endurecimiento *(siguiente)*

**Prioridad:** 🟢 Baja  
**Bizagi:** E1–E3, S4 | **Mockups:** panel estratégico, config. motor

- [ ] Pantalla soporte: parámetros del motor de recomendación
- [ ] Panel estratégico: indicadores agregados (solo lectura)
- [ ] Logs de auditoría básicos
- [ ] Script de respaldo SQLite
- [ ] Pruebas de humo / E2E en flujos críticos
- [ ] Evaluación de segunda fuente externa (post-Remotive)

---

## Matriz de dependencias

| Fase | Depende de | Bloquea |
|------|------------|---------|
| F1 | F0 | F2, F3, F4, F5 |
| F2 | F1 | F4, F5 |
| F3 | F2 | F4, F5 |
| F4 | F3 | F5 |
| F5 | F3, F4 | F6 |
| F6 | F5 | — |

---

## Relación con roadmap canónico (`docs/10-roadmap.md`)

| Doc canónico | Este roadmap |
|--------------|--------------|
| Fase 2.3 Remotive | → Fase 1 (worker) |
| Cierre visual empleos | → Fase 1 (frontend) |
| Módulo perfil | → Fase 2 |
| Módulo recomendaciones | → Fase 2 |
| Fuentes adicionales | → Fase 6 |

Este documento **extiende** `docs/10-roadmap.md` con fases de auth, postulaciones, admin y soporte requeridas por la tesis y los procesos Bizagi, sin contradecir las reglas de no sobreingeniería del MVP.

---

## Próximo paso inmediato

**Fase 6:** pantalla soporte del motor, panel estratégico, auditoría y endurecimiento.

Ver también: [`IMPLEMENTATION_AUDIT.md`](IMPLEMENTATION_AUDIT.md) · [`MODULES.md`](MODULES.md) · [`UI_FLOW.md`](UI_FLOW.md)
