# Estado actual del proyecto - Continental Oportunidades

## Estado general
Fases cerradas: 2.3 (Remotive), Fase 1 (empleos UI), Fase 2 (perfil + recomendaciones), Fase 3 (autenticación y roles), **Fase 4 (postulaciones y favoritos)**.

## Implementado actualmente
- Autenticación JWT con roles: estudiante, egresado, administrador, soporte
- Tabla `usuario` + vínculo `perfil.usuario_id`
- Endpoints `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Protección API: `perfil` y `recomendaciones` requieren token y rol estudiantil
- UI login institucional, rutas protegidas, cierre de sesión
- **Postulaciones:** registro, historial, estados (`registrada`, `en_proceso`, `cerrada`), redirección a `url_oferta`
- **Favoritos:** guardar/quitar oferta, listado en dashboard
- Tablas `postulacion` y `favorito` con índices únicos por perfil+empleo
- Endpoints `GET/POST /api/postulaciones`, `GET/POST/DELETE /api/favoritos`
- UI: acciones en detalle `/empleos/:id`, historial en dashboard, rutas `/postulaciones` y `/favoritos`
- Usuarios demo (contraseña `Continental2026`):
  - estudiante@continental.edu.pe
  - egresado@continental.edu.pe
  - admin@continental.edu.pe
  - soporte@continental.edu.pe
- Módulos empleos, fuentes, worker Remotive, marketplace y detalle UI

## Restricción técnica actual
- Sin SSO institucional (fase futura)
- Paneles admin/reportes pendientes (Fase 5)

## Siguiente paso: Fase 5
- CRUD ofertas manuales (admin)
- Dashboard reportes institucionales (O5)
