# Estado actual del proyecto - Continental Oportunidades

## Estado general
Fases cerradas: 2.3 (Remotive), Fase 1 (empleos UI), Fase 2 (perfil + recomendaciones), Fase 3 (autenticación y roles), Fase 4 (postulaciones y favoritos), **Fase 5 (administración y reportes)**.

## Implementado actualmente
- Autenticación JWT con roles: estudiante, egresado, administrador, soporte
- Tabla `usuario` + vínculo `perfil.usuario_id`
- Endpoints `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Protección API: `perfil` y `recomendaciones` requieren token y rol estudiantil
- UI login institucional, rutas protegidas, cierre de sesión
- Postulaciones y favoritos (proceso O4)
- **Administración:** CRUD ofertas manuales (fuente Institucional), archivado lógico `empleo.activo`
- **Reportes:** indicadores institucionales y exportación CSV (O5)
- Endpoints `GET/POST/PUT/PATCH /api/admin/empleos`, `GET /api/admin/reportes/*`
- UI admin: `/admin/ofertas`, `/admin/reportes` (rol administrador)
- Usuarios demo (contraseña `Continental2026`):
  - estudiante@continental.edu.pe
  - egresado@continental.edu.pe
  - admin@continental.edu.pe
  - soporte@continental.edu.pe
- Módulos empleos, fuentes, worker Remotive, marketplace y detalle UI

## Restricción técnica actual
- Sin SSO institucional (fase futura)
- Panel estratégico y config. motor pendientes (Fase 6)

## Siguiente paso: Fase 6
- Configuración del motor de recomendación (soporte)
- Panel estratégico, auditoría y respaldos SQLite
