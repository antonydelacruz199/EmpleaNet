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
| Autenticación | Login, roles, control de acceso | ✅ Fase 3 |
| Usuarios y perfiles | Registro académico-profesional | ✅ Fase 2 |
| Ofertas (empleos) | Listado, detalle, filtros, fuentes | ✅ Fase 1 |
| Recomendaciones | Motor por reglas + puntaje | ✅ Fase 2 |
| Postulaciones | Registro y seguimiento | ✅ Fase 4 |
| Favoritos | Ofertas guardadas | ✅ Fase 4 |
| Reportes | Indicadores institucionales + CSV | ✅ Fase 5 |
| Administración | CRUD ofertas manuales | ✅ Fase 5 |
| Soporte | Mantenimiento, config. motor | ❌ Fase 6 |
| Integraciones | Worker Remotive → SQLite | ✅ Fase 1 |

Detalle en [`MODULES.md`](MODULES.md).

## Alcance funcional (MVP técnico actual)

Según `docs/02-alcance-funcional.md`:

**Implementado (Fases 1–5):**
- Recopilación Remotive, empleos end-to-end, perfil, recomendaciones, auth, postulaciones, favoritos
- Administración de ofertas manuales y reportes institucionales (O5)

**Pendiente (Fase 6):**
- Configuración del motor (S2), panel estratégico (E3), auditoría y endurecimiento

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
- [`FASE-5-ADMIN-REPORTES.md`](FASE-5-ADMIN-REPORTES.md) — cierre Fase 5
- [`DB_RULES.md`](DB_RULES.md) — reglas de datos
