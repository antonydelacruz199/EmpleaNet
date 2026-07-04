# Estado actual del proyecto - Continental Oportunidades

## Estado general
**Roadmap PROMPT 0 completado (Fases 0–6).** Incluye empleos end-to-end, perfil, recomendaciones, auth, postulaciones, favoritos, administración, reportes, soporte técnico y panel estratégico.

## Implementado actualmente
- Autenticación JWT con roles: estudiante, egresado, administrador, soporte
- Módulos empleos, perfil, recomendaciones, postulaciones, favoritos, admin y soporte
- Worker Remotive → SQLite compartida con API
- **Fase 5:** CRUD ofertas manuales, reportes CSV, archivado `empleo.activo`
- **Fase 6:** motor configurable, auditoría, incidencias, panel estratégico, scripts backup/smoke
- UI: marketplace, detalle, dashboard estudiante, paneles admin/soporte
- Documentación de cierre por fase en `docs/FASE-5-*.md`, `docs/FASE-6-*.md`

### Usuarios demo (contraseña `Continental2026`)
| Correo | Rol |
|--------|-----|
| estudiante@continental.edu.pe | estudiante |
| egresado@continental.edu.pe | egresado |
| admin@continental.edu.pe | administrador |
| soporte@continental.edu.pe | soporte |

## Restricción técnica actual
- Sin SSO institucional
- Segunda fuente externa evaluada documentalmente; Remotive sigue siendo la única fuente activa

## Documentación
- [`FASE-6-SOPORTE-ESTRATEGIA.md`](FASE-6-SOPORTE-ESTRATEGIA.md)
- [`EVALUACION-SEGUNDA-FUENTE.md`](EVALUACION-SEGUNDA-FUENTE.md)
- [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md)
