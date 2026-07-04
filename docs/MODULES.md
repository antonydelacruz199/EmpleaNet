# Módulos del sistema — Continental Oportunidades

Mapa funcional de módulos con estado de implementación, referencias Bizagi y mockups.

**Leyenda:** ✅ Implementado · ⚠️ Parcial/stub · ❌ Pendiente · 📋 Diseñado (schema/docs)

---

## 1. Autenticación

| Atributo | Valor |
|----------|-------|
| **Propósito** | Control de acceso por roles institucionales |
| **Actores** | Todos |
| **Estado** | ✅ Implementado (Fase 3) |
| **Bizagi** | O1 (autenticación e inicio de sesión), S3 (validación credenciales, permisos) |
| **Mockup** | `mockups/inicio_de_sesi_n_continental_oportunidades/` |
| **Rutas planificadas** | `/login`, middleware API auth |
| **Depende de** | Tablas `usuario`, sesión/JWT |

**Funcionalidades:**
- Login / logout
- Roles: estudiante, egresado, administrador, soporte
- Protección de rutas frontend y endpoints API

---

## 2. Usuarios y perfiles

| Atributo | Valor |
|----------|-------|
| **Propósito** | Registro y mantenimiento del perfil académico-profesional |
| **Actores** | Estudiante, egresado |
| **Estado** | ✅ Implementado (Fase 2) |
| **Bizagi** | O1 (registro datos personales/académicos, habilidades, actualización) |
| **Mockup** | `mockups/dashboard_de_estudiante_continental_oportunidades/` |
| **Rutas actuales** | `/perfil` |
| **Rutas planificadas** | `/perfil/editar`, `/dashboard` |
| **Tabla** | `perfil` 📋 |

**API implementada:**
- `GET /api/perfil/me` → SQLite
- `PUT /api/perfil/me` → actualizar habilidades, ubicación; recalcula recomendaciones

---

## 3. Ofertas (empleos)

| Atributo | Valor |
|----------|-------|
| **Propósito** | Centralizar, listar, filtrar y mostrar detalle de oportunidades |
| **Actores** | Todos (lectura); administrador (escritura manual, Fase 5) |
| **Estado** | ✅ API + UI marketplace y detalle |
| **Bizagi** | O2 (registro manual, importación, validación, publicación), O3 (consulta, filtros) |
| **Mockups** | `marketplace_de_oportunidades_*`, `detalle_de_oportunidad_*`, `gesti_n_de_ofertas_*` |
| **Rutas actuales** | `/empleos`, `/empleos/:id`, `/admin/ofertas` |
| **Tablas** | `empleo`, `fuente_empleo` ✅ |

**API implementada:**
- `GET /api/empleos` — filtros `q`, `ubicacion`, `modalidad`, `fuente`, paginación (solo `activo=1`)
- `GET /api/empleos/:id` — detalle
- `GET/POST/PUT/PATCH /api/admin/empleos*` — gestión admin (Fase 5)

---

## 4. Recomendaciones

| Atributo | Valor |
|----------|-------|
| **Propósito** | Sugerir ofertas por afinidad con perfil del usuario |
| **Actores** | Estudiante, egresado; soporte (config., Fase 6) |
| **Estado** | ✅ Implementado (Fase 2) |
| **Bizagi** | O3 (análisis coincidencia, generación, ordenamiento), S2 (reglas, parámetros, evaluación) |
| **Mockups** | `dashboard_de_estudiante_*`, `configuraci_n_del_motor_*` |
| **Rutas actuales** | `/recomendados` |
| **Tabla** | `recomendacion` 📋 |

**API implementada:**
- `GET /api/recomendaciones` → scores desde `recomendacion` + motivo (JWT estudiantil)

**Motor:** reglas ponderadas en `docs/08-motor-recomendacion.md` (`recomendacion.motor.ts`)

---

## 5. Postulaciones

| Atributo | Valor |
|----------|-------|
| **Propósito** | Registrar intención de postulación y seguimiento de estado |
| **Actores** | Estudiante, egresado |
| **Estado** | ✅ Implementado (Fase 4) |
| **Bizagi** | O4 (verificación requisitos, registro, confirmación, historial, seguimiento) |
| **Mockup** | Acciones en `detalle_de_oportunidad_*`; historial en `dashboard_de_estudiante_*` |
| **Rutas actuales** | `/postulaciones`, acción en `/empleos/:id` |
| **Tabla** | `postulacion` ✅ |

**API:** `GET/POST /api/postulaciones`, `GET /api/postulaciones/resumen`, `GET /api/postulaciones/empleo/:id`

---

## 6. Favoritos

| Atributo | Valor |
|----------|-------|
| **Propósito** | Guardar ofertas de interés para consulta posterior |
| **Actores** | Estudiante, egresado |
| **Estado** | ✅ Implementado (Fase 4) |
| **Bizagi** | O4 (gestión ofertas favoritas o guardadas) |
| **Mockup** | Detalle oportunidad (acción guardar) |
| **Rutas actuales** | `/favoritos`, acción en `/empleos/:id` |
| **Tabla** | `favorito` ✅ |

**API:** `GET/POST /api/favoritos`, `DELETE /api/favoritos/:empleoId`

---

## 7. Reportes

| Atributo | Valor |
|----------|-------|
| **Propósito** | Indicadores de uso para gestión institucional |
| **Actores** | Administrador |
| **Estado** | ✅ Implementado (Fase 5) |
| **Bizagi** | O5 (reportes usuarios, ofertas, recomendaciones, postulaciones; exportación) |
| **Mockup** | `dashboard_de_reportes_institucionales_continental_oportunidades/` |
| **Rutas actuales** | `/admin/reportes` |

**Indicadores MVP:**
- Total usuarios activos
- Ofertas publicadas / fuente
- Recomendaciones generadas
- Postulaciones registradas
- Favoritos guardados
- Exportación CSV

**Documentación:** [`FASE-5-ADMIN-REPORTES.md`](FASE-5-ADMIN-REPORTES.md)

---

## 8. Administración

| Atributo | Valor |
|----------|-------|
| **Propósito** | Gestión operativa de ofertas y supervisión del servicio |
| **Actores** | Administrador |
| **Estado** | ✅ Ofertas manuales (Fase 5) · ❌ Panel estratégico (Fase 6) |
| **Bizagi** | O2 (registro manual), O5 (consulta indicadores), E2 (monitoreo) |
| **Mockups** | `gesti_n_de_ofertas_*`, `dashboard_de_reportes_*`, `panel_estrat_gico_*` |
| **Rutas actuales** | `/admin/ofertas`, `/admin/reportes` |
| **Rutas pendientes** | `/admin/estrategico` (Fase 6) |

**API:** `GET/POST/PUT/PATCH /api/admin/empleos*`

---

## 9. Soporte

| Atributo | Valor |
|----------|-------|
| **Propósito** | Mantenimiento técnico, configuración del motor, incidencias |
| **Actores** | Soporte técnico |
| **Estado** | ❌ Pendiente (Fase 6) |
| **Bizagi** | S2 (config. parámetros motor), S4 (incidencias, corrección, actualización) |
| **Mockup** | `configuraci_n_del_motor_de_recomendaci_n_soporte_t_cnico/` |
| **Rutas planificadas** | `/soporte/motor`, `/soporte/incidencias` |

---

## 10. Integraciones

| Atributo | Valor |
|----------|-------|
| **Propósito** | Recolección automática desde fuentes externas |
| **Actores** | Sistema (worker) |
| **Estado** | ✅ Remotive verificado (Fase 1 / 2.3) |
| **Bizagi** | S5 (identificación fuentes, conexión, validación, transformación, sincronización), O2 (importación) |
| **Mockup** | — (proceso backend) |
| **Ubicación** | `workers/recolector/` |

**Componentes:**
- `extractores.py` — Remotive API
- `normalizadores.py` — mapeo a `empleo`
- `repositorio.py` — SQLite + dedup

**Fase actual:** solo Remotive (`docs/07-recoleccion-empleos.md`)

---

## 11. Módulos transversales

| Módulo | Ubicación | Estado |
|--------|-----------|--------|
| **Health** | `GET /api/health` | ✅ |
| **Fuentes** | `GET /api/fuentes` | ✅ SQLite |
| **Seguridad base** | Helmet, CORS, rate-limit, JWT | ✅ |
| **Base de datos** | `database/schema.sql` + migraciones 003–005 | ✅ |
| **Design system** | `apps/web/src/styles/` + mockups | ✅ Aplicado (Fase 1+) |

---

## Matriz módulo ↔ Bizagi ↔ mockup

| Módulo | BPMN | Mockup | Fase roadmap |
|--------|------|--------|--------------|
| Autenticación | O1, S3 | inicio sesión | F3 |
| Perfiles | O1 | dashboard estudiante | F2 |
| Ofertas | O2, O3 | marketplace, detalle, gestión | F1, F5 |
| Recomendaciones | O3, S2 | dashboard, config. motor | F2, F6 |
| Postulaciones | O4 | detalle, dashboard | F4 |
| Favoritos | O4 | detalle | F4 |
| Reportes | O5 | dashboard reportes | F5 |
| Administración | O2, O5, E3 | gestión, reportes, panel | F5, F6 |
| Soporte | S2, S4 | config. motor | F6 |
| Integraciones | S5 | — | F1 |

---

## Módulo `fuentes` (catálogo)

| Atributo | Valor |
|----------|-------|
| **API** | `GET /api/fuentes` (stub) |
| **Tabla** | `fuente_empleo` ✅ |
| **Bizagi** | S5, O2 |
| **Fase** | F1 (activar lectura real al cerrar Remotive) |

Ver [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) para orden de implementación.
