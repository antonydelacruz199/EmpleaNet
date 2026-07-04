# Continental Oportunidades

**Sistema de recomendación de ofertas laborales y acceso eficiente a oportunidades** para estudiantes y egresados de la **Universidad Continental**.

Este repositorio (`EmpleaNet`) contiene el monorepo técnico del proyecto de tesis: frontend web, API backend, worker de recolección, base de datos SQLite, documentación, diagramas BPMN y mockups de diseño.

## Propósito

Centralizar ofertas laborales y prácticas desde fuentes externas, permitir búsqueda y filtrado, y recomendar oportunidades según el perfil académico y profesional del usuario institucional.

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Node.js 20+, Express 5, TypeScript, Zod |
| Worker | Python 3.11+ |
| Base de datos | SQLite |

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+
- Python 3.11+ (worker)

## Desarrollo local

```bash
pnpm install
pnpm dev:api    # API en http://localhost:4000
pnpm dev:web    # Web en http://localhost:5173 (proxy /api → :4000)
```

### Worker de recolección

```bash
cd workers/recolector
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
pip install -e .
python -m recolector
```

## Estructura del repositorio

```
apps/web              Frontend React
apps/api              API REST Express
workers/recolector    Recolección Remotive → SQLite
database/             schema.sql, seeds.sql, empleanet.db
docs/                 Documentación canónica y roadmap
bizagi/               Diagramas BPMN (procesos E, O, S)
mockups/              Pantallas Stitch + design system
```

## Estado actual (resumen)

| Área | Estado |
|------|--------|
| Módulo `empleos` (API + SQLite) | ✅ Implementado |
| Worker Remotive | ⚠️ Código presente; verificar ejecución |
| Frontend UI (mockups) | ⚠️ Esqueleto básico |
| Perfil, recomendaciones, auth | ❌ Stub o pendiente |

Consulta la auditoría completa en [`docs/IMPLEMENTATION_AUDIT.md`](docs/IMPLEMENTATION_AUDIT.md) y el plan de fases en [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md).

## Documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/00-estado-actual.md` | Estado oficial del proyecto |
| `docs/IMPLEMENTATION_AUDIT.md` | Auditoría técnica inicial |
| `docs/DEVELOPMENT_ROADMAP.md` | Roadmap de implementación por fases |
| `docs/PROJECT_CONTEXT.md` | Contexto institucional y alcance |
| `docs/MODULES.md` | Mapa de módulos del sistema |

## Licencia y contexto académico

Proyecto de tesis — Universidad Continental. Uso institucional y académico.
