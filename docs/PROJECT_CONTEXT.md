# Contexto del proyecto — Continental Oportunidades

## Nombre del sistema

**Continental Oportunidades** — nombre institucional oficial del sistema.

El repositorio técnico se denomina `EmpleaNet` (monorepo). En documentación, UI y entregables de tesis se usa siempre **Continental Oportunidades**.

## Propósito institucional

Sistema web de la **Universidad Continental** orientado a:

1. **Centralizar** ofertas laborales y prácticas provenientes de fuentes externas e institucionales.
2. **Facilitar el acceso eficiente** mediante búsqueda, filtrado y navegación estructurada.
3. **Recomendar oportunidades** según el perfil académico y profesional de estudiantes y egresados.

### Problema que aborda

Las oportunidades laborales están dispersas en múltiples portales. Los estudiantes y egresados invierten tiempo excesivo en búsquedas poco focalizadas y pierden visibilidad de ofertas alineadas a su formación en la Universidad Continental.

### Propuesta de valor

Un punto único institucional que normaliza ofertas, las hace buscables y prioriza las más relevantes para cada perfil, apoyando la empleabilidad de la comunidad universitaria.

## Relación con la tesis

**Título de tesis:** *Sistema de recomendación de ofertas laborales y acceso eficiente a oportunidades para estudiantes y egresados de la Universidad Continental.*

| Artefacto de tesis | Ubicación en repo |
|--------------------|-------------------|
| Procesos de negocio (BPMN) | `/bizagi` (E1–E3, O1–O5, S1–S5) |
| Diseño de interfaz (mockups) | `/mockups` (8 pantallas + design system) |
| Implementación técnica | `apps/web`, `apps/api`, `workers/recolector` |
| Estado del arte | `/articulos` |
| Documentación técnica | `/docs` |

## Actores

| Actor | Rol | Procesos Bizagi principales |
|-------|-----|----------------------------|
| **Estudiante / Egresado** | Consulta, filtra, recibe recomendaciones, postula o guarda ofertas | O1, O3, O4 |
| **Administrador institucional** | Gestiona ofertas manuales, consulta reportes | O2, O5 |
| **Soporte técnico** | Mantiene sistema, configura motor, atiende incidencias | S2, S4 |
| **Comité / gestión estratégica** | Planifica, monitorea, decide mejoras | E1, E2, E3 |
| **Sistema (automático)** | Recolecta, normaliza, recomienda, audita | S1, S5, O3 |
| **Empresa / fuente externa** | Publica ofertas en portales externos (Remotive, etc.) | O2, S5 |

## Módulos del sistema

| Módulo | Descripción | Estado código |
|--------|-------------|---------------|
| Autenticación | Login, roles, control de acceso | ❌ Pendiente |
| Usuarios y perfiles | Registro académico-profesional | ⚠️ Stub |
| Ofertas (empleos) | Listado, detalle, filtros, fuentes | ✅ API real |
| Recomendaciones | Motor por reglas + puntaje | ⚠️ Stub |
| Postulaciones | Registro y seguimiento | ❌ Pendiente |
| Favoritos | Ofertas guardadas | ❌ Pendiente |
| Reportes | Indicadores institucionales | ❌ Pendiente |
| Administración | CRUD ofertas, usuarios | ❌ Pendiente |
| Soporte | Mantenimiento, config. motor | ❌ Pendiente |
| Integraciones | Worker Remotive → SQLite | ⚠️ Código presente |

Detalle en [`MODULES.md`](MODULES.md).

## Alcance funcional (MVP técnico actual)

Según `docs/02-alcance-funcional.md`:

**Incluido en el MVP técnico:**
- Recopilación desde fuente externa (Remotive, fase 2.3)
- Almacenamiento normalizado en SQLite
- Búsqueda y filtrado de empleos (API)
- Recomendación por puntaje (diseñado, pendiente implementación real)
- Perfil básico del usuario (diseñado, pendiente implementación real)
- Gestión de fuentes de empleo

**Incluido en alcance de tesis (fases posteriores):**
- Autenticación con roles institucionales
- Postulaciones y favoritos (O4)
- Paneles administrativos y reportes (O5)
- Configuración del motor (S2) y panel estratégico (E3)

## Exclusiones explícitas

No forman parte del alcance inmediato:

- Postulación automática en portales externos
- Aplicación móvil nativa
- SSO institucional avanzado (fase futura)
- Scraping masivo de HTML
- Machine learning / IA generativa
- Chatbot
- Notificaciones en tiempo real
- Panel analítico BI avanzado
- Múltiples fuentes en paralelo (hasta cerrar Remotive)

## Stack tecnológico (sin cambios)

| Capa | Tecnología | Ubicación |
|------|------------|-----------|
| Frontend | React 19, TypeScript, Vite 6, React Router 7 | `apps/web` |
| Backend | Node.js ≥20, Express 5, TypeScript, Zod | `apps/api` |
| Worker | Python ≥3.11 (stdlib) | `workers/recolector` |
| Base de datos | SQLite (`better-sqlite3`) | `database/` |
| Monorepo | pnpm 9+ | raíz |

## Arquitectura resumida

```
Estudiante/Egresado ──► apps/web ──► apps/api ──► SQLite ◄── workers/recolector ◄── Remotive API
Administrador/Soporte ──► apps/web ──► apps/api ──► SQLite
```

Reglas: frontend sin lógica de negocio pesada; backend con validación y servicios; worker solo extracción/normalización/persistencia. Ver `docs/03-arquitectura.md`.

## Documentos relacionados

- [`IMPLEMENTATION_AUDIT.md`](IMPLEMENTATION_AUDIT.md) — estado técnico actual
- [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) — plan por fases
- [`SYSTEM_RULES.md`](SYSTEM_RULES.md) — reglas de negocio
- [`UI_FLOW.md`](UI_FLOW.md) — flujos de interfaz
- [`DB_RULES.md`](DB_RULES.md) — reglas de datos
