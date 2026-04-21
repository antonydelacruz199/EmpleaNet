# EmpleaNet

Monorepo para recopilación de empleos, búsqueda con filtros y recomendaciones según perfil.

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+
- Python 3.11+ (worker)

## Desarrollo

```bash
pnpm install
pnpm dev:api
pnpm dev:web
```

API por defecto: `http://localhost:4000`. Web: `http://localhost:5173` (proxy a la API en Vite).

## Estructura

- `apps/web` — React, TypeScript, Vite, React Router
- `apps/api` — Express, TypeScript
- `workers/recolector` — Python
- `database` — esquemas y migraciones (cuando existan)
- `docs` — documentación adicional

## Worker Python

```bash
cd workers/recolector
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
python -m recolector
```
