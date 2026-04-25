# Fase 01 - Base de arquitectura

## Estado
Completada

## Objetivo
Diseñar una base de arquitectura simple, modular y mantenible para que EmpleaNet pudiera crecer sin caer en desorden, duplicidad ni acoplamiento excesivo.

## Problema que resuelve
Era necesario evitar una arquitectura inflada o mal distribuida desde el inicio.  
Sin esta fase, el proyecto podía quedar:
- demasiado fragmentado
- con demasiadas carpetas
- con responsabilidades mezcladas
- con frontend, backend y worker acoplados
- difícil de mantener con Cursor

## Contexto previo
Después de definir el alcance del sistema, se necesitaba una estructura física del proyecto que respetara las responsabilidades reales del sistema.

## Trabajo realizado

### Definición del monorepo
Se adoptó una estructura raíz con separación por áreas:

- `apps/web`
- `apps/api`
- `workers/recolector`
- `database`
- `docs`
- `.cursor/rules`

### Ubicación del proyecto
Se eligió una ruta de desarrollo limpia fuera de XAMPP y de carpetas sincronizadas:

`G:\dev\EmpleaNet`

### Principios aplicados
- frontend separado del backend
- worker separado de la API
- base de datos separada del código
- documentación centralizada
- reglas de IA centralizadas

## Decisiones técnicas importantes
- no usar una estructura excesivamente profunda
- no crear paquetes compartidos innecesarios desde el inicio
- mantener el frontend organizado por módulos
- mantener el backend organizado por módulos
- dejar el worker mínimo y aislado

## Resultado de la fase
Al finalizar esta fase, quedó establecida la estructura general del proyecto y se eliminó el riesgo de comenzar con una base improvisada.

## Archivos y carpetas relacionadas
- `apps/`
- `workers/`
- `database/`
- `docs/`
- `.cursor/`

## Siguiente fase relacionada
`fase-01-1-documentacion-canonica.md`