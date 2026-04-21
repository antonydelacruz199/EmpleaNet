# Seguridad - EmpleaNet

## Principios
- toda entrada externa es no confiable
- toda entrada del usuario es no confiable
- toda oferta recolectada desde portales externos es no confiable
- la seguridad se aplica desde el inicio, no al final

## Reglas obligatorias del backend
- validar todos los datos de entrada
- sanitizar contenido externo cuando sea necesario
- limitar tamaño de payload
- manejar errores de forma centralizada
- usar headers de seguridad
- configurar CORS de forma explícita
- registrar eventos relevantes en logs
- no exponer errores internos al cliente
- no concatenar SQL manualmente con datos de entrada
- usar variables de entorno para secretos y configuración sensible

## Reglas obligatorias del recolector
- no confiar en HTML externo
- normalizar texto antes de persistir
- evitar guardar contenido peligroso o irrelevante
- deduplicar empleos antes de publicarlos
- registrar fallos de extracción y de normalización

## Reglas obligatorias del frontend
- no almacenar secretos
- no duplicar validación crítica del backend
- usar un solo cliente HTTP
- no confiar en datos externos sin validación del backend

## Seguridad inicial esperada en la API
- setupSecurity centralizado
- helmet
- CORS explícito
- rate limiting
- validación de entrada
- manejo centralizado de errores
- desactivación de x-powered-by

## Decisiones iniciales
- no implementar autenticación avanzada en esta fase
- no abrir endpoints innecesarios
- mantener la superficie de ataque pequeña en el MVP