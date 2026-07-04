# Módulo de autenticación — Continental Oportunidades

Documentación del módulo auth ampliado (PROMPT 2), sobre la base JWT de Fase 3.

## Roles

| Rol | Descripción | Registro público |
|-----|-------------|------------------|
| `estudiante` | Usuario académico | Sí |
| `egresado` | Egresado UC | Sí |
| `administrador` | Gestión institucional | No (seed/demo) |
| `soporte` | Mantenimiento técnico | No (seed/demo) |
| `empresa` | Empresa o fuente externa | Sí |

## Endpoints (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | No | Inicio de sesión |
| POST | `/register` | No | Registro (estudiante, egresado, empresa) |
| POST | `/forgot-password` | No | Solicitud de restablecimiento |
| POST | `/reset-password` | No | Restablecer con token |
| POST | `/logout` | JWT | Cierre de sesión (cliente borra token) |
| GET | `/me` | JWT | Usuario en sesión |

## Seguridad

- Contraseñas: **scrypt** (`node:crypto`)
- JWT HS256, secret `JWT_SECRET` (mín. 16 caracteres)
- Contraseña segura en registro/reset: 8+ caracteres, mayúscula, minúscula y número
- Bloqueo temporal tras **5** intentos fallidos (**15** minutos)
- Bitácora en tabla `auditoria`: `login_exitoso`, `login_fallido`, `login_bloqueado`, `registro_usuario`, `password_reset_*`

## Base de datos

- `usuario`: email único, rol, `intentos_fallidos`, `bloqueado_hasta`
- `perfil.perfil_completo`: control de primer acceso
- `password_reset_token`: tokens hasheados SHA-256, expiran en 1 h
- Migración: `database/migrations/007_auth_extended.sql`

## Frontend

| Ruta | Pantalla |
|------|----------|
| `/login` | Inicio de sesión |
| `/registro` | Registro |
| `/recuperar-contrasena` | Olvidé mi contraseña |
| `/restablecer-contrasena` | Reset con token |
| `/primer-acceso` | Completar perfil (estudiante, egresado, empresa) |

Tras login/registro, usuarios con `perfilCompleto: false` se redirigen a `/primer-acceso`.

## Usuarios demo

Contraseña: `Continental2026`

- estudiante@continental.edu.pe
- egresado@continental.edu.pe
- admin@continental.edu.pe
- soporte@continental.edu.pe
- empresa@continental.edu.pe

## Recuperación de contraseña (MVP)

Sin envío de correo real. En entornos no productivos, `POST /forgot-password` incluye `devResetToken` en la respuesta para pruebas.

## Tests

```bash
pnpm --filter @empleanet/api test
```

Cubre: login OK, login fallido, registro, ruta protegida, restricción por rol.

## Middleware

- `requireAuth`: valida JWT Bearer
- `requireRoles(...)`: autorización por rol en rutas API
