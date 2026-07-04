# Módulo O3 — Búsqueda, filtros y motor de recomendación

Núcleo de la tesis: marketplace con búsqueda avanzada y recomendaciones personalizadas basadas en reglas ponderadas.

## Ponderación O3

| Variable | Peso |
|----------|------|
| Habilidades | 35% |
| Carrera / afinidad académica | 25% |
| Intereses laborales | 15% |
| Modalidad | 10% |
| Ubicación | 10% |
| Experiencia | 5% |

Soporte técnico puede ajustar pesos vía `motor_config` (suma = 100).

## Interpretación del puntaje

| Rango | Nivel |
|-------|-------|
| 80 – 100 | Alta coincidencia |
| 60 – 79 | Coincidencia media |
| 40 – 59 | Coincidencia baja |
| 0 – 39 | No recomendable |

Por defecto el listado de recomendaciones **oculta** ofertas bajo 40 pts (`recommendation_settings.puntaje_minimo`).

## Reglas de negocio

1. **Solo ofertas activas** — se excluyen cerradas, archivadas y vencidas (`SQL_OFERTA_PUBLICA`).
2. **Penalización por postulación** — ofertas ya postuladas pierden 15 pts y se ordenan al final.
3. **Recálculo** — al actualizar perfil/preferencias o vía `POST /recomendaciones/recalcular`.
4. **Explicabilidad** — cada recomendación incluye `motivo`, `razones[]` y `desglose` por variable.

## Base de datos

Migración: `database/migrations/010_recommendation_engine.sql`

| Objeto | Uso |
|--------|-----|
| `recommendation_settings` | Umbral mínimo, penalización postulado |
| `preferencia_laboral` | Modalidad, ubicación y categorías de interés |
| `perfil.carrera`, `intereses`, `anos_experiencia` | Datos académico-profesionales |
| `recomendacion.nivel`, `desglose` | Resultado persistido por perfil/oferta |
| `motor_config.intereses` | Peso configurable (reemplaza `actualidad`) |

## API

### Marketplace — `GET /api/empleos`

Filtros: `q`, `ubicacion`, `modalidad`, `categoria`, `tipo`, `empresa`, `fechaDesde`, `fechaHasta`, `fuente`, paginación.

Solo devuelve ofertas publicadas y vigentes.

### Recomendaciones (estudiante/egresado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/recomendaciones` | Listado personalizado (`limit`, `nivel`) |
| POST | `/api/recomendaciones/recalcular` | Recalcular para el usuario autenticado |
| GET | `/api/recomendaciones/coincidencia/:empleoId` | Detalle de match para una oferta |
| GET | `/api/recomendaciones/preferencias` | Preferencias laborales |
| PUT | `/api/recomendaciones/preferencias` | Actualizar preferencias + recalcular |

### Respuesta de recomendación

```json
{
  "puntaje": 72.5,
  "nivel": "media",
  "motivo": "Coinciden tus habilidades: react, typescript. Modalidad remoto alineada.",
  "razones": ["Coinciden tus habilidades: react, typescript", "Modalidad remoto compatible con tu preferencia"],
  "desglose": {
    "habilidades": 28,
    "carrera": 18,
    "intereses": 10,
    "modalidad": 10,
    "ubicacion": 4,
    "experiencia": 2.5
  },
  "yaPostulado": false,
  "empleo": { "...": "..." }
}
```

## Arquitectura backend

```
recommendation.engine.ts     # Cálculo puro (sin HTTP ni DB)
RecommendationService        # Orquestación (recomendaciones.service.ts)
RecomendacionesRepository    # Persistencia recomendacion + preferencias
RecomendacionesController    # HTTP delgado
```

El cálculo **nunca** se duplica en frontend.

## Frontend

| Ruta | Funcionalidad |
|------|---------------|
| `/empleos` | Marketplace + panel de filtros O3 |
| `/recomendados` | Recomendaciones con nivel, desglose y recalcular |
| `/empleos/:id` | Detalle + bloque “Tu coincidencia” |
| `/perfil` | Habilidades + preferencias laborales |

## Tests

```bash
pnpm --filter @empleanet/api test
```

- `recommendation.engine.test.ts` — puntaje, carrera, skills, niveles
- `recomendaciones.test.ts` — exclusión cerradas, penalización postulado, filtro mínimo

## Flujo del estudiante

1. Completar perfil (habilidades, carrera, intereses, preferencias).
2. Ver recomendaciones en `/recomendados`.
3. Filtrar por nivel de coincidencia.
4. Explorar marketplace con filtros adicionales.
5. En detalle de oferta, revisar justificación del puntaje.
6. Recalcular tras cambios de perfil.
