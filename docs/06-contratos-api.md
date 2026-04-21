# Contratos API - EmpleaNet

## Convenciones
- prefijo base: /api
- respuestas JSON
- mensajes de error controlados
- validación de entrada obligatoria

## Módulo empleos

### GET /api/empleos
Retorna listado de empleos

Filtros posibles:
- texto
- ubicacion
- modalidad
- fecha
- fuente

### GET /api/empleos/:id
Retorna detalle de un empleo

## Módulo perfil

### GET /api/perfil/:id
Retorna el perfil actual

### POST /api/perfil
Crea perfil

### PUT /api/perfil/:id
Actualiza perfil

## Módulo recomendaciones

### GET /api/recomendaciones/:perfilId
Retorna recomendaciones calculadas para un perfil

## Módulo fuentes

### GET /api/fuentes
Lista fuentes registradas

### POST /api/fuentes
Registra una nueva fuente

### PUT /api/fuentes/:id
Actualiza fuente

## Notas
- no definir todavía endpoints innecesarios
- los contratos pueden crecer, pero deben mantenerse simples y consistentes