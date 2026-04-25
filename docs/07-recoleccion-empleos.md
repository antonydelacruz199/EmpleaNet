# Recolección de empleos - EmpleaNet

## Objetivo
El recolector obtiene ofertas laborales desde una fuente externa, normaliza y persiste ofertas en el modelo de EmpleaNet (SQLite) para que queden accesibles vía `GET /api/empleos`.

## Estado actual
El worker en `workers/recolector` tiene estructura mínima; no hay aún **integración productiva** con una API externa.

## Fase 2.3 — fuente única: Remotive API
- La **primera y única** integración real de esta fase es **Remotive API**.
- Se usa para validar el flujo completo (extraer, normalizar, guardar) sin depender de HTML inestable.

## Fuera de alcance en 2.3
- no scraping de HTML
- no segundas fuentes ni múltiples conectores en paralelo
- no mezclar lógica del worker en `apps/api` o en el frontend
- no tocar `perfil`, `recomendaciones` ni `auth`
- no almacenar HTML bruto

## Flujo
1. Consultar Remotive API (acuerdo con sus términos y límites).
2. Extraer ofertas.
3. Normalizar a campos alineados con la tabla `empleo`.
4. Deduplicar (estrategia mínima, según diseño de la fase).
5. Insertar/actualizar en SQLite (misma base que la API local).
6. Comprobar listado y filtros vía `GET /api/empleos`.

## Condiciones de integración
- conservar enlace a la oferta original
- registrar Remotive en `fuente_empleo` (identificable como origen)
- asumir retraso de la API pública (~24 h en documentación pública)
- no redistribuir ofertas fuera de lo permitido por Remotive

## Campos mínimos tras normalización
Alineado con el modelo: `fuente_id`, título, empresa, ubicación, modalidad, descripción, `url_oferta`, fecha de publicación cuando exista en origen.

## Estructura actual del paquete
- `extractores.py` — conexión a la API y crudo
- `normalizadores.py` — mapeo a columnas de `empleo`
- `repositorio.py` — escritura a SQLite
- `__main__.py` — punto de entrada

## Resultado esperado
Ejecución manual del worker que carga ofertas reales de Remotive; visibles en el mismo `GET /api/empleos` y detalle `GET /api/empleos/:id` (sin endpoints nuevos obligatorios).
