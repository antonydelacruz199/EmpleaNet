# Estado actual del proyecto - Continental Oportunidades

## Estado general
Fases cerradas: 2.3 (Remotive), Fase 1 (empleos UI), Fase 2 (perfil + recomendaciones), **Fase 3 (autenticación y roles)**.

## Implementado actualmente
- Autenticación JWT con roles: estudiante, egresado, administrador, soporte
- Tabla `usuario` + vínculo `perfil.usuario_id`
- Endpoints `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Protección API: `perfil` y `recomendaciones` requieren token y rol estudiantil
- UI login institucional, rutas protegidas, cierre de sesión
- Usuarios demo (contraseña `Continental2026`):
  - estudiante@continental.edu.pe
  - egresado@continental.edu.pe
  - admin@continental.edu.pe
  - soporte@continental.edu.pe
- Módulos empleos, fuentes, worker Remotive, marketplace y detalle UI

## Restricción técnica actual
- Sin SSO institucional (fase futura)
- Postulaciones, favoritos, paneles admin/reportes pendientes (Fases 4–5)

## Siguiente paso: Fase 4
- Postulaciones y favoritos (proceso O4)
- Tablas `postulacion`, `favorito`
