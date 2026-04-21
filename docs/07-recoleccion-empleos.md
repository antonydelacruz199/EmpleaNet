
---

## `docs/07-recoleccion-empleos.md`

```md
# Recolección de empleos - EmpleaNet

## Objetivo
El recolector de EmpleaNet obtendrá ofertas laborales desde fuentes externas, transformará la información a un formato uniforme y la guardará en el sistema para que luego pueda ser consultada desde la API.

## Estado actual
El worker de recolección ya tiene estructura base, pero todavía no implementa una extracción real operativa desde una fuente externa.

Actualmente existen los archivos base del worker:
- `extractores.py`
- `normalizadores.py`
- `repositorio.py`
- `__main__.py`

Sin embargo, la recolección web real aún no forma parte del flujo funcional validado del sistema.

## Flujo objetivo del recolector
1. leer fuente configurada
2. extraer datos
3. limpiar y normalizar contenido
4. validar estructura mínima
5. deduplicar
6. guardar resultado
7. registrar ejecución

## Responsabilidades del recolector
- extraer empleos desde fuentes externas
- convertir contenido en un formato uniforme
- evitar duplicados
- guardar empleos válidos
- registrar errores de extracción y normalización

## Reglas
- no mezclar scraping con lógica de frontend
- no mezclar scraping con la API pública
- no guardar HTML innecesario o peligroso
- no asumir que una fuente externa será estable
- registrar cambios importantes de estructura en una fuente
- tratar toda fuente externa como entrada no confiable
- no implementar múltiples fuentes simultáneamente en esta fase

## Regla de implementación actual
La recolección web real se desarrollará solo después de cerrar la persistencia real del módulo `empleos` en SQLite.

Antes de implementar scraping real, debe estar resuelto:
- `conexion.ts`
- `schema.sql`
- `seeds.sql`
- `empleos.repository.ts` leyendo desde SQLite

## Alcance inicial del recolector
Cuando se implemente la recolección real:
- se comenzará con una sola fuente externa
- se priorizará un flujo simple: extraer → normalizar → guardar
- no se desarrollarán varios extractores al mismo tiempo
- no se introducirá sobreingeniería temprana

## Estructura mínima del worker
- `extractores.py`
- `normalizadores.py`
- `repositorio.py`
- `__main__.py`

## Resultado esperado
El worker debe producir empleos listos para búsqueda y recomendación, no datos crudos sin tratamiento.