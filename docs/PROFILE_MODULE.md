# Módulo de perfiles — Continental Oportunidades

Implementación alineada con Bizagi **O1** y mockups del dashboard estudiante.

## Alcance

Perfil académico-profesional para roles **estudiante** y **egresado**:

- Datos personales (nombre, teléfono, ubicación, resumen)
- Perfil académico (carrera, ciclo o año de egreso según rol)
- Habilidades (catálogo + relación `perfil_habilidad`)
- Intereses laborales (`perfil_interes`)
- Experiencia (`experiencia`)
- CV (archivo en `uploads/cv/`)
- **Completitud automática** (0–100 %, umbral 80 % = perfil completo)
- Vista admin de detalle de usuario

## Reglas

- Un usuario → un perfil (`perfil.usuario_id` UNIQUE)
- El rol (`estudiante` / `egresado`) viene de `usuario.rol`
- Estudiante requiere `ciclo_actual`; egresado requiere `anio_egreso`
- El motor de recomendación usa habilidades, carrera, intereses, experiencia y ubicación
- Perfil incompleto: `perfil_completo = 0`, `completitud_pct < 80`

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `perfil` | Extendida: teléfono, resumen, carrera_id, ciclo, egreso, cv, completitud |
| `carrera` | Catálogo de carreras |
| `habilidad` | Catálogo de habilidades |
| `perfil_habilidad` | Relación perfil ↔ habilidad |
| `interes` | Catálogo de intereses |
| `perfil_interes` | Relación perfil ↔ interés |
| `experiencia` | Experiencia laboral/prácticas |

Migración: `database/migrations/008_profile_module.sql`

## API — estudiante/egresado

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/perfil/me` | Perfil completo + completitud |
| GET | `/api/perfil/me/completitud` | Solo completitud |
| PUT | `/api/perfil/me` | Editar personal + académico |
| PUT | `/api/perfil/me/habilidades` | Reemplazar habilidades |
| PUT | `/api/perfil/me/intereses` | Reemplazar intereses |
| POST | `/api/perfil/me/experiencia` | Agregar experiencia |
| PUT | `/api/perfil/me/experiencia/:id` | Editar experiencia |
| DELETE | `/api/perfil/me/experiencia/:id` | Eliminar experiencia |
| POST | `/api/perfil/me/cv` | Subir CV (base64) |
| GET | `/api/perfil/me/cv` | Descargar CV |
| DELETE | `/api/perfil/me/cv` | Eliminar CV |
| GET | `/api/perfil/carreras` | Catálogo de carreras |

## API — administrador

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/usuarios` | Lista usuarios con % completitud |
| GET | `/api/admin/usuarios/:usuarioId/perfil` | Detalle de perfil |

## Frontend

| Ruta | Pantalla |
|------|----------|
| `/perfil` | Resumen + completitud |
| `/perfil/editar` | Editar perfil |
| `/perfil/habilidades` | Gestionar habilidades |
| `/perfil/intereses` | Gestionar intereses |
| `/perfil/experiencia` | Experiencia laboral |
| `/perfil/cv` | Carga/actualización de CV |
| `/admin/usuarios` | Lista institucional |
| `/admin/usuarios/:id` | Detalle admin |

## Completitud (pesos)

| Sección | Peso máx. |
|---------|-----------|
| Personal | 25 % |
| Académico | 25 % |
| Habilidades (≥3) | 20 % |
| Intereses (≥2) | 15 % |
| Experiencia (≥1) | 10 % |
| CV | 5 % |

## Tests

```bash
pnpm --filter @empleanet/api test
```

- `perfil.completitud.test.ts` — cálculo de completitud
- `perfil.test.ts` — CRUD API integración

## Pendientes naturales

- Edición/eliminación avanzada de experiencia en UI
- Envío de CV a empresas / visibilidad institucional
- Integración con módulo auth (primer acceso) si se mergea `feature/auth-roles-access`
