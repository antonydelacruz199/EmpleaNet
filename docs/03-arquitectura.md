# Arquitectura - EmpleaNet

## Arquitectura general
El sistema se divide en tres bloques principales:

1. Frontend web
2. API backend
3. Worker de recolección

## Frontend
Tecnologías:
- React
- TypeScript
- Vite
- React Router

Responsabilidades:
- mostrar listado de empleos
- mostrar detalle de empleo
- mostrar recomendaciones
- permitir búsqueda y filtrado
- gestionar perfil del usuario
- consumir la API mediante un único cliente HTTP

Ubicación:
- apps/web

## Backend
Tecnologías:
- Node.js
- Express
- TypeScript

Responsabilidades:
- exponer endpoints REST
- validar entradas
- aplicar seguridad base
- gestionar lógica de negocio
- acceder a la base de datos
- exponer información para frontend y recolector

Ubicación:
- apps/api

## Recolector
Tecnologías:
- Python

Responsabilidades:
- consultar fuentes externas
- extraer información
- normalizar empleos
- guardar información en el sistema

Ubicación:
- workers/recolector

## Base de datos
Responsabilidades:
- almacenar fuentes
- almacenar empleos
- almacenar perfiles
- almacenar resultados de recomendación o scores calculados cuando aplique

## Reglas arquitectónicas
- el frontend no contiene lógica de negocio pesada
- el backend concentra la validación y la lógica de negocio
- el recolector no expone UI ni lógica de presentación
- cada módulo debe tener una responsabilidad clara
- no duplicar lógica entre frontend, backend y worker
- no crear carpetas o capas innecesarias

## Estado técnico actual
El módulo `empleos` ya persiste y lee ofertas desde SQLite; el siguiente paso natural es cerrar filtros en API y detalle en frontend antes de perfil, recomendaciones o recolección web real.