# Auditoría técnica inicial — Continental Oportunidades

> **Sistema:** Continental Oportunidades  
> **Tesis:** Sistema de recomendación de ofertas laborales y acceso eficiente a oportunidades para estudiantes y egresados de la Universidad Continental.  
> **Repositorio:** `EmpleaNet` (monorepo técnico)  
> **Fecha de auditoría:** julio 2026

---

## 1. Resumen ejecutivo

Continental Oportunidades cuenta con una **base técnica sólida y bien documentada** para un MVP académico: monorepo pnpm con frontend React, API Express y worker Python sobre SQLite compartida. El único módulo **funcionalmente cerrado** es `empleos` (listado, detalle, filtros SQL y paginación en backend). El resto de módulos (`perfil`, `recomendaciones`, `fuentes`) existen como **andamiaje con datos simulados**; no hay autenticación, roles, postulaciones, favoritos ni reportes implementados.

Los artefactos de diseño institucional (**13 diagramas BPMN** en `/bizagi` y **8 mockups** en `/mockups`) cubren el alcance completo de la tesis, pero el código actual implementa aproximadamente **15–20 %** de ese alcance funcional. La brecha principal está en UI (mockups no reflejados), identidad/roles, flujos de postulación y paneles administrativos.

**Recomendación:** avanzar por fases incrementales sin cambiar stack, cerrando primero recolección Remotive + UI de empleos, luego perfil y motor de recomendación por reglas, y recién después autenticación institucional y módulos administrativos.

---

## 2. Estructura actual del repositorio

```
EmpleaNet/
├── apps/
│   ├── api/          # Express 5 + TypeScript + better-sqlite3
│   └── web/          # React 19 + Vite 6 + React Router 7
├── workers/
│   └── recolector/   # Python 3.11+ (stdlib, sin deps externas)
├── database/
│   ├── schema.sql    # DDL SQLite (4 tablas)
│   └── seeds.sql     # Datos de desarrollo
├── docs/             # Documentación canónica (11 archivos)
├── bizagi/           # 13 procesos BPMN (E, O, S)
├── mockups/          # 8 pantallas Stitch + design system
├── articulos/        # Material de estado del arte (PDFs)
├── package.json      # Scripts: dev:web, dev:api, build, lint
└── pnpm-workspace.yaml
```

| Capa | Ubicación | Stack |
|------|-----------|-------|
| Frontend | `apps/web` | React, TypeScript, Vite, React Router |
| Backend | `apps/api` | Node.js ≥20, Express 5, Zod, Helmet, CORS, rate-limit |
| Worker | `workers/recolector` | Python ≥3.11, urllib, sqlite3 |
| Base de datos | `database/empleanet.db` | SQLite (compartida API + worker) |

**Patrón arquitectónico:** routes → controllers → services → repositories → schemas (consistente en API).

---

## 3. Módulos implementados

### 3.1 Backend (`apps/api`)

| Módulo | Rutas | Estado | Detalle |
|--------|-------|--------|---------|
| **health** | `GET /api/health` | ✅ Operativo | Respuesta `{ status: "ok" }` |
| **empleos** | `GET /api/empleos`, `GET /api/empleos/:id` | ✅ **Real (SQLite)** | Filtros: `q`, `ubicacion`, `modalidad`, `fuente`, `page`, `limit` |
| **perfil** | `GET /api/perfil/me` | ⚠️ Stub | Retorna perfil hardcodeado; no lee tabla `perfil` |
| **recomendaciones** | `GET /api/recomendaciones` | ⚠️ Stub parcial | Carga empleos de DB pero filtra por `tags` (campo inexistente) |
| **fuentes** | `GET /api/fuentes` | ⚠️ Stub | Datos hardcodeados; no lee `fuente_empleo` |

**Seguridad base:** Helmet, CORS explícito, rate limiting, validación Zod, manejo centralizado de errores.

### 3.2 Frontend (`apps/web`)

| Ruta | Componente | Estado |
|------|------------|--------|
| `/` | `InicioPage` | ✅ Esqueleto básico |
| `/empleos` | `EmpleosPage` | ⚠️ Lista `<ul>` sin filtros, paginación ni diseño mockup |
| `/perfil` | `PerfilPage` | ⚠️ Consume stub de API |
| `/recomendados` | `RecomendacionesPage` | ⚠️ Consume stub de API |

**Cliente HTTP único:** `apps/web/src/core/http/clienteHttp.ts` (proxy Vite → `:4000`).

**No existe:** página de detalle `/empleos/:id` (aunque `fetchEmpleoById` sí está en API client), login, dashboards, paneles admin.

### 3.3 Worker (`workers/recolector`)

| Componente | Archivo | Estado |
|------------|---------|--------|
| Extractor Remotive | `extractores.py` | ✅ Código presente |
| Normalizador | `normalizadores.py` | ✅ Mapeo a tabla `empleo` |
| Repositorio SQLite | `repositorio.py` | ✅ Dedup por `url_oferta` |
| CLI | `__main__.py` | ✅ Flujo extract → normalize → persist |

**Nota:** La documentación canónica (`docs/07-recoleccion-empleos.md`, `docs/00-estado-actual.md`) aún marca Fase 2.3 como pendiente, pero el código del worker ya existe. Falta **verificación operativa** documentada (ejecución + datos visibles en API).

### 3.4 Base de datos

**Tablas existentes:** `fuente_empleo`, `empleo`, `perfil`, `recomendacion`.

**Sin:** tablas de usuarios, sesiones, postulaciones, favoritos, auditoría, roles.

**Migraciones:** no hay sistema versionado; solo `schema.sql` + auto-init en desarrollo + ALTER runtime para `modalidad`.

---

## 4. Módulos faltantes

Respecto al alcance de la tesis y los procesos Bizagi:

| Módulo / capacidad | BPMN | Mockup | Código | Prioridad tesis |
|--------------------|------|--------|--------|-----------------|
| Autenticación e inicio de sesión | O1, S3 | `inicio_de_sesi_n_*` | ❌ | Alta (institucional) |
| Registro y gestión de perfiles reales | O1 | `dashboard_de_estudiante_*` | ⚠️ Stub | Alta |
| Marketplace / búsqueda con filtros UI | O3 | `marketplace_*` | ⚠️ API sí, UI no | Alta |
| Detalle de oportunidad | O4 | `detalle_de_oportunidad_*` | ⚠️ API sí, UI no | Alta |
| Motor de recomendación por reglas | O3, S2 | `dashboard_de_estudiante_*` | ⚠️ Stub | Alta |
| Postulaciones y seguimiento | O4 | (parcial en dashboard) | ❌ | Media |
| Favoritos / ofertas guardadas | O4 | (parcial) | ❌ | Media |
| Gestión de ofertas (admin) | O2 | `gesti_n_de_ofertas_*` | ❌ | Media |
| Reportes institucionales | O5 | `dashboard_de_reportes_*` | ❌ | Media |
| Panel estratégico / mejora continua | E3 | `panel_estrat_gico_*` | ❌ | Baja (tesis) |
| Config. motor recomendación (soporte) | S2 | `configuraci_n_del_motor_*` | ❌ | Baja |
| Integración fuentes externas (operativa) | S5, O2 | — | ⚠️ Solo Remotive en código | Alta (fase actual) |
| Seguridad avanzada / respaldos | S3 | — | ❌ | Media (futuro) |
| Soporte técnico / incidencias | S4 | — | ❌ | Baja |

---

## 5. Diferencias entre mockups/Bizagi y código real

### 5.1 Identidad visual

| Aspecto | Mockups (`/mockups`) | Código (`apps/web`) |
|---------|----------------------|---------------------|
| Design system | Inter, azul institucional `#002356`, sidebar + header | Estilos inline mínimos, sin design system |
| Layout | Sidebar persistente, cards, tablas densas | Header simple con nav horizontal |
| Componentes | Botones, badges, steppers, tablas | Listas HTML básicas |

### 5.2 Flujos funcionales

| Flujo Bizagi | Esperado | Real |
|--------------|----------|------|
| **O1** Registro → auth → perfil académico | Ciclo completo usuario | Sin auth; perfil stub |
| **O2** Registro manual + importación externa | Admin + worker | Solo lectura API; worker no verificado en prod |
| **O3** Consulta → filtros → perfil → recomendación | Pipeline completo | Filtros solo en API; recomendaciones vacías |
| **O4** Detalle → postular/guardar → seguimiento | Flujo estudiante | Sin detalle UI, postulación ni favoritos |
| **O5** Reportes paralelos (usuarios, ofertas, rec., postulaciones) | Dashboard admin | No implementado |
| **S2** Configurar reglas → ejecutar motor → evaluar | Motor administrable | Sin motor real ni pantalla soporte |
| **S3** Credenciales → permisos → auditoría → backup | Seguridad institucional | Solo Helmet/CORS/rate-limit |
| **S5** Identificar fuentes → conectar → validar → integrar | Multi-fuente | Remotive en worker; una sola fuente |

### 5.3 Mapa mockup → ruta actual

| Mockup | Equivalente deseado | Ruta actual |
|--------|---------------------|-------------|
| Inicio de sesión | `/login` | ❌ No existe |
| Marketplace de oportunidades | `/empleos` (con filtros) | `/empleos` (básico) |
| Detalle de oportunidad | `/empleos/:id` | ❌ No existe |
| Dashboard estudiante | `/dashboard` o `/` autenticado | `/` básico |
| Gestión ofertas admin | `/admin/ofertas` | ❌ No existe |
| Dashboard reportes | `/admin/reportes` | ❌ No existe |
| Panel estratégico | `/admin/estrategico` | ❌ No existe |
| Config. motor recomendación | `/soporte/recomendacion` | ❌ No existe |

---

## 6. Riesgos técnicos

| Riesgo | Impacto | Mitigación propuesta |
|--------|---------|----------------------|
| Brecha mockup ↔ código | Alta — demo tesis poco creíble | Fase UI con design system de `/mockups` |
| Módulos stub confundidos con reales | Media — desarrollo sobre bases falsas | Documentar estado (este audit + MODULES.md) |
| Sin auth ni roles | Alta — procesos O1/S3 no cubiertos | Fase dedicada; no mezclar con MVP empleos |
| Worker vs docs desincronizados | Media — fase 2.3 mal cerrada | Verificar ejecución Remotive y actualizar docs |
| SQLite sin migraciones | Media — evolución schema frágil | Scripts de migración incrementales por fase |
| Recomendaciones filtran campo inexistente | Alta — módulo roto silenciosamente | Corregir al implementar motor real |
| Alcance tesis > MVP documentado | Media — expectativas vs entregables | Roadmap explícito con exclusiones por fase |
| Nombre repo (EmpleaNet) vs institucional (Continental Oportunidades) | Bajo — confusión comunicacional | Usar nombre institucional en UI/docs; mantener repo |

---

## 7. Propuesta de roadmap por fases

### Fase 0 — Cierre documental y alineación *(actual)*
- Auditoría técnica, base documental, README actualizado.
- **Entregable:** este documento + `DEVELOPMENT_ROADMAP.md` + docs base.

### Fase 1 — Recolección real y empleos end-to-end *(prioridad alta)*
- Verificar/cerrar worker Remotive → SQLite.
- UI marketplace + detalle alineados a mockups.
- Filtros y paginación en frontend.
- **Bizagi:** O2 (importación), S5 (integración). **Mockups:** marketplace, detalle.

### Fase 2 — Perfil y recomendaciones *(prioridad alta)*
- CRUD perfil contra SQLite (`perfil`).
- Motor por reglas en backend (`docs/08-motor-recomendacion.md`).
- Persistir en `recomendacion`; UI recomendados en dashboard estudiante.
- **Bizagi:** O1 (perfil), O3, S2. **Mockups:** dashboard estudiante.

### Fase 3 — Autenticación y roles institucionales *(prioridad alta)*
- Login básico (estudiante/egresado, administrador, soporte).
- Protección de rutas; sesiones o JWT según `docs/04-seguridad.md`.
- **Bizagi:** O1, S3. **Mockup:** inicio de sesión.

### Fase 4 — Postulaciones, favoritos y seguimiento *(prioridad media)*
- Tablas `postulacion`, `favorito`; flujo O4.
- Enlace externo a oferta original (no postulación automática en portal externo).

### Fase 5 — Administración y reportes *(prioridad media)*
- CRUD ofertas manuales (admin).
- Dashboard reportes (indicadores básicos, no BI avanzado).
- **Bizagi:** O2, O5. **Mockups:** gestión ofertas, reportes.

### Fase 6 — Soporte, estrategia y endurecimiento *(prioridad baja)*
- Pantalla config. motor (soporte).
- Panel estratégico (indicadores E2/E3).
- Respaldos, logs de auditoría, pruebas E2E.
- **Bizagi:** E1–E3, S4. **Mockups:** panel estratégico, config. motor.

---

## 8. Priorización

### Alta
1. Verificar worker Remotive y poblar SQLite.
2. UI empleos (marketplace + detalle) según design system.
3. Perfil real + motor de recomendación por reglas.
4. Autenticación básica con roles.

### Media
5. Postulaciones y favoritos.
6. Gestión admin de ofertas.
7. Reportes institucionales básicos.
8. Sistema de migraciones SQLite.

### Baja
9. Panel estratégico y mejora continua (E1–E3).
10. Módulo soporte técnico formal (S4).
11. Fuentes adicionales post-Remotive.
12. Respaldos automatizados y auditoría avanzada.

---

## 9. Referencias internas

| Documento | Contenido |
|-----------|-----------|
| `docs/00-estado-actual.md` | Snapshot oficial del proyecto |
| `docs/02-alcance-funcional.md` | MVP y exclusiones |
| `docs/05-modelo-datos.md` | Modelo SQLite actual |
| `docs/10-roadmap.md` | Roadmap canónico previo |
| `mockups/continental_oportunidades_design_system/DESIGN.md` | Design system institucional |
| `bizagi/*.bpmn` | Procesos estratégicos, operativos y de soporte |

---

*Documento generado como parte de la auditoría técnica inicial. No implica cambios de código en módulos de negocio.*
