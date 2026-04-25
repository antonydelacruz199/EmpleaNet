# Fase 01.2 - Reglas de Cursor

## Estado
Completada

## Objetivo
Configurar reglas claras para que Cursor generara código alineado con la arquitectura de EmpleaNet y no introdujera sobreingeniería, duplicidad ni funcionalidades fuera de fase.

## Problema que resuelve
Antes de formalizar estas reglas, existía el riesgo de que Cursor:
- inflara la arquitectura
- creara archivos y carpetas innecesarias
- mezclara idiomas en nombres
- duplicara tipos o clientes HTTP
- propusiera módulos no implementables aún

## Trabajo realizado
Se creó y ajustó:

`.cursor/rules/architecture.mdc`

## Reglas principales establecidas
- no sobreingenierizar
- no crear carpetas profundas innecesarias
- no duplicar lógica, tipos, validaciones ni utilidades
- mantener un solo cliente HTTP en frontend
- mantener controladores ligeros
- mover lógica de negocio a `services`
- mover acceso a datos a `repositories`
- mover validación a `schemas`
- respetar siempre el alcance actual
- no asumir scraping real si aún no existe
- no implementar `auth` en esta fase
- no avanzar a perfil ni recomendaciones antes de cerrar empleos

## Integración con documentación
Se hizo que Cursor tomara como referencia obligatoria:
- `docs/00-estado-actual.md`
- `docs/03-arquitectura.md`
- `docs/06-contratos-api.md`
- `docs/10-roadmap.md`
- y el resto de documentos canónicos del proyecto

## Resultado de la fase
Cursor quedó mejor alineado con la realidad actual del proyecto y con las decisiones ya tomadas.

## Archivos relacionados
- `.cursor/rules/architecture.mdc`

## Siguiente fase relacionada
`fase-01-3-levantamiento-inicial.md`