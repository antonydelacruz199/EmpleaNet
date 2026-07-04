# Evaluación de segunda fuente externa (post-Remotive)

> Documento de análisis para Fase 6 — **sin implementación** en esta entrega.  
> Regla vigente del MVP: Remotive sigue siendo la **única fuente activa** en producción.

## Contexto

Continental Oportunidades cerró la Fase 1/2.3 con **Remotive API** como fuente única (`docs/07-recoleccion-empleos.md`). Ampliar fuentes requiere validar impacto en normalización, deduplicación y operación.

## Candidatos evaluados (referencia académica)

| Fuente | Tipo | Ventajas | Riesgos |
|--------|------|----------|---------|
| **Adzuna API** | API REST | Cobertura LATAM/Europa, JSON estructurado | Cuota/limitaciones comerciales |
| **Arbeitnow** | API pública | Simple, remoto-first | Volumen limitado, enfoque global |
| **Greenhouse/Lever** | API por empresa | Alta calidad por empresa | Requiere acuerdos por empleador |
| **RSS institucional** | RSS | Control universitario | Heterogeneidad de formatos |

## Criterios de selección (MVP)

1. API estable con JSON (sin scraping HTML en fase inicial).
2. Campos mapeables a `empleo`: título, empresa, ubicación, modalidad, descripción, `url_oferta`.
3. Volumen suficiente para pruebas de recomendación (>50 ofertas tech).
4. Licencia compatible con uso académico.
5. Bajo costo operativo (sin infra adicional).

## Recomendación

**Siguiente candidato sugerido:** Adzuna API o fuente RSS institucional acordada con la Universidad Continental.

**No activar en paralelo** hasta:
- Cerrar pruebas de carga SQLite con volumen combinado.
- Definir regla de deduplicación cross-fuente (`url_oferta` + titulo+empresa).
- Actualizar worker con patrón extractor/normalizador ya usado en Remotive.

## Impacto técnico estimado

- Nueva fila en `fuente_empleo`.
- Nuevo extractor en `workers/recolector/src/recolector/extractores.py`.
- Sin cambio de tablas si el modelo normalizado se mantiene.
- Panel admin: revisión de ofertas importadas (ya parcialmente cubierto en Fase 5).

## Decisión Fase 6

**Posponer integración real.** Documentar evaluación y mantener Remotive como única fuente operativa, alineado con las reglas del proyecto en fases 2.3–5.
