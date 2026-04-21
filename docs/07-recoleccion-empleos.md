# Recolección de empleos - EmpleaNet

## Objetivo
El recolector obtiene ofertas laborales desde fuentes externas, transforma la información a un formato uniforme y la guarda en el sistema.

## Flujo base
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
- registrar errores de extracción

## Reglas
- no mezclar scraping con lógica de frontend
- no mezclar scraping con API pública
- no guardar HTML innecesario o peligroso
- no asumir que una fuente externa será estable
- registrar cambios de estructura de una fuente

## Estructura mínima del worker
- extractores.py
- normalizadores.py
- repositorio.py
- __main__.py

## Resultado esperado
El worker debe producir empleos listos para búsqueda y recomendación, no datos crudos sin tratamiento.