# Fase 00 - Definición del proyecto

## Estado
Completada

## Objetivo
Definir con claridad qué sistema se iba a construir, cuál sería su alcance inicial, qué tecnologías se utilizarían y qué principios guiarían la arquitectura del proyecto.

## Problema que resuelve
Antes de comenzar el desarrollo, era necesario evitar improvisación técnica y conceptual.  
Sin esta fase, el proyecto podía terminar con:
- un alcance confuso
- tecnologías mal elegidas
- sobreingeniería temprana
- arquitectura espagueti
- funcionalidades fuera del objetivo principal

## Contexto previo
Al inicio del proyecto se evaluaron distintas alternativas para el sistema, incluyendo una plataforma más amplia.  
Luego se decidió recortar el alcance para trabajar primero sobre un núcleo funcional y viable.

## Decisiones principales tomadas
Se definió que EmpleaNet sería un sistema enfocado en:
- recopilación de empleos
- búsqueda y filtrado
- recomendación de empleos según perfil

## Tecnologías elegidas
- frontend: React
- backend: Node.js + Express + TypeScript
- worker de recolección: Python
- persistencia inicial: SQLite
- estructura general: monorepo

## Principios arquitectónicos definidos
- código limpio
- baja duplicidad
- separación de responsabilidades
- seguridad desde el inicio
- evitar sobreingeniería
- no confundir código limpio con crear demasiados archivos

## Resultado de la fase
Al finalizar esta fase, el proyecto ya tenía:
- nombre definido: **EmpleaNet**
- alcance inicial claro
- stack tecnológico definido
- criterio de arquitectura establecido
- orden lógico para el desarrollo por fases

## Archivos relacionados
Esta fase dio origen conceptual a:
- `docs/01-vision-producto.md`
- `docs/02-alcance-funcional.md`
- `docs/03-arquitectura.md`
- `docs/10-roadmap.md`

## Siguiente fase relacionada
`fase-01-base-de-arquitectura.md`