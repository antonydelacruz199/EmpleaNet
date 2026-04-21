# Reglas de código - EmpleaNet

## Principios
- clean code
- DRY
- KISS
- separación de responsabilidades
- consistencia de nombres
- simplicidad antes que sobrearquitectura

## Reglas obligatorias
- no crear un archivo por cada proceso si la responsabilidad sigue siendo la misma
- no duplicar lógica, tipos, validaciones ni utilidades
- crear nuevos archivos solo cuando la responsabilidad cambie claramente
- mantener el frontend organizado por módulos
- mantener el backend organizado por módulos
- usar un solo cliente HTTP en frontend
- mantener controladores ligeros
- mover lógica de negocio a services
- mover acceso a datos a repositories
- mover validación a schemas
- usar nombres claros y consistentes
- no mezclar español e inglés en nombres de archivos
- no crear placeholders vacíos sin utilidad real

## Señales de mala práctica
- helpers repetidos
- funciones iguales en distintos módulos
- carpetas profundas sin necesidad
- módulos creados antes de ser necesarios
- lógica importante en componentes visuales
- lógica de negocio dentro de rutas o controladores

## Criterio de creación de archivos
Se crea un archivo nuevo solo si:
- aparece una responsabilidad nueva
- el archivo actual ya mezcla dos responsabilidades
- la separación mejora lectura, prueba y mantenimiento