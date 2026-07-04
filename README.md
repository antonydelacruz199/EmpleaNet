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
database/             schema.sql, seeds.sql, migraciones, empleanet.db
docs/                 Documentación canónica y roadmap
bizagi/               Diagramas BPMN (procesos E, O, S)
mockups/              Pantallas Stitch + design system
articulos/            Estado del arte y plan de pruebas
```

## Estado actual (resumen)

| Área | Estado |
|------|--------|
| Empleos + worker Remotive | ✅ Fase 1 |
| Perfil y recomendaciones | ✅ Fase 2 |
| Auth JWT y roles | ✅ Fase 3 |
| Postulaciones y favoritos | ✅ Fase 4 |
| Admin ofertas + reportes CSV | ✅ Fase 5 |
| Soporte, auditoría y panel estratégico | ✅ Fase 6 |
| **Roadmap F0–F6** | **✅ Completo** |

Consulta [`docs/00-estado-actual.md`](docs/00-estado-actual.md), [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md), [`docs/FASE-6-SOPORTE-ESTRATEGIA.md`](docs/FASE-6-SOPORTE-ESTRATEGIA.md).

### Usuarios demo

Contraseña para todos: `Continental2026`

| Correo | Rol |
|--------|-----|
| estudiante@continental.edu.pe | estudiante |
| egresado@continental.edu.pe | egresado |
| admin@continental.edu.pe | administrador |
| soporte@continental.edu.pe | soporte |

## Documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/00-estado-actual.md` | Estado oficial del proyecto |
| `docs/FASE-5-ADMIN-REPORTES.md` | Cierre Fase 5: admin y reportes |
| `docs/FASE-6-SOPORTE-ESTRATEGIA.md` | Cierre Fase 6: soporte y estrategia |
| `docs/DEVELOPMENT_ROADMAP.md` | Roadmap de implementación por fases |
| `docs/MODULES.md` | Mapa de módulos del sistema |
| `docs/06-contratos-api.md` | Contratos API |
| `articulos/plan de pruebas/` | Plan de pruebas institucional |

## Licencia y contexto académico

Proyecto de tesis — Universidad Continental. Uso institucional y académico.
