# Estado actual del proyecto - Continental Oportunidades

## Estado general
El proyecto tiene arquitectura base, documentación canónica, frontend y backend operativos, worker con integración Remotive y persistencia real en SQLite. **Fases cerradas:** 2.3 (Remotive), Fase 1 UI (empleos), Fase 2 (perfil + recomendaciones).

## Implementado actualmente
- estructura monorepo definida
- apps/web operativo con layout institucional (sidebar + header)
- apps/api operativo
- worker Remotive en `workers/recolector`
- endpoints `empleos`, `fuentes`, `perfil`, `recomendaciones` operativos con SQLite
- UI marketplace, detalle, perfil editable, recomendados y dashboard estudiante
- motor de recomendación por reglas con persistencia en `recomendacion`
- deduplicación worker por `url_oferta` + fuente Remotive

## Restricción técnica actual
- Sin autenticación ni roles (Fase 3); perfil demo fijo (`id=1`).
- Postulaciones, favoritos, admin y reportes pendientes (Fases 4–5).

## Reglas de acotación vigentes
- fuente externa integrada: **Remotive API**
- no scraping HTML en esta etapa
- no añadir `auth` hasta Fase 3

## Condiciones de uso Remotive
- conservar el enlace original de la oferta
- registrar Remotive como fuente en `fuente_empleo`
- asumir retraso ~24 h de la API pública
- no redistribuir ofertas fuera de términos Remotive

## Siguiente paso: Fase 3
- Autenticación básica con roles institucionales
- Protección de rutas y sesión/JWT
- Pantalla login según mockup
