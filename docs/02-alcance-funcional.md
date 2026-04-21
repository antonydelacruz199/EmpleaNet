# Alcance funcional - EmpleaNet

## Alcance actual del MVP
El MVP de EmpleaNet incluirá únicamente:

1. Recopilación de ofertas laborales desde fuentes externas
2. Almacenamiento normalizado de ofertas
3. Búsqueda y filtrado de empleos
4. Recomendación de empleos según perfil
5. Gestión básica del perfil del usuario
6. Gestión de fuentes de empleo

## Funcionalidades incluidas
- listar empleos
- ver detalle de empleo
- buscar por texto
- filtrar por ubicación, modalidad, fecha y categoría
- registrar o editar perfil básico del usuario
- calcular recomendaciones por puntaje
- registrar fuentes activas de recolección
- sincronizar empleos desde el recolector

## Funcionalidades excluidas por ahora
- postulación automática
- app móvil
- autenticación avanzada o SSO
- scraping de muchas fuentes al mismo tiempo
- panel analítico avanzado
- chatbot
- IA generativa
- recomendación basada en machine learning complejo
- notificaciones en tiempo real

## Criterios de simplicidad
- no sobreingenierizar
- no crear módulos que todavía no se usarán
- no implementar autenticación avanzada antes de necesitarla
- no introducir infraestructura compleja en el MVP