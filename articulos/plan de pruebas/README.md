# Plan de pruebas — Continental Oportunidades

Documento de plan de pruebas del sistema EmpleaNet / Continental Oportunidades.

| Archivo | Descripción |
|---------|-------------|
| [Plan_de_Pruebas_Continental_Oportunidades.docx](./Plan_de_Pruebas_Continental_Oportunidades.docx) | Plan de pruebas institucional (Universidad Continental) |

## Relación con el proyecto

El plan cubre la verificación de los módulos implementados según el roadmap (`docs/DEVELOPMENT_ROADMAP.md`) y los flujos definidos en `docs/UI_FLOW.md`.

## Estado de fases al momento del plan

- **Fases 1–6 implementadas:** roadmap PROMPT 0 completo

## Casos sugeridos Fase 5 (admin / reportes)

Ver [`docs/FASE-5-ADMIN-REPORTES.md`](../../docs/FASE-5-ADMIN-REPORTES.md) sección 5 (verificación manual).

- Login administrador y acceso a `/admin/ofertas` y `/admin/reportes`
- Alta, edición y archivado de oferta manual (fuente Institucional)
- Visibilidad en marketplace según `empleo.activo`
- Exportación CSV de indicadores O5
- Denegación de rutas admin para rol estudiante
