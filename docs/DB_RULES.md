# Reglas de base de datos — Continental Oportunidades

Reglas de integridad, relaciones y restricciones para SQLite. Complementa `docs/05-modelo-datos.md` con reglas operativas para desarrollo.

**Motor:** SQLite · **Archivo:** `database/empleanet.db` · **DDL:** `database/schema.sql`

---

## 1. Principios generales

| ID | Regla |
|----|-------|
| DB-01 | `PRAGMA foreign_keys = ON` en toda conexión (API y worker) |
| DB-02 | No concatenar SQL con input de usuario; usar prepared statements |
| DB-03 | Evolución por scripts incrementales; no editar `schema.sql` sin migración documentada |
| DB-04 | Seeds solo para desarrollo (`database/seeds.sql`); no en producción |
| DB-05 | API y worker comparten la misma base física |

---

## 2. Tablas actuales

### 2.1 `fuente_empleo`

| Campo | Restricción |
|-------|-------------|
| `id` | PK autoincrement |
| `nombre` | NOT NULL; único lógico por nombre de fuente |
| `tipo` | NOT NULL (`api`, `rss`, `html`, `manual`) |
| `activa` | 0 o 1; fuente inactiva no recibe nuevas ofertas del worker |

**Reglas:**
- Remotive debe existir como registro antes de insertar ofertas del worker (S5).
- Desactivar fuente (`activa=0`) no elimina empleos existentes.

**Bizagi:** S5, O2

---

### 2.2 `empleo`

| Campo | Restricción |
|-------|-------------|
| `fuente_id` | FK → `fuente_empleo.id`, NOT NULL |
| `titulo` | NOT NULL |
| `empresa` | NOT NULL |
| `modalidad` | Valores normalizados: `remoto`, `presencial`, `hibrido` |
| `url_oferta` | Recomendado NOT NULL para fuentes externas |
| `descripcion` | Texto plano; sin HTML crudo |

**Duplicados prohibidos (worker):**
- Primario: misma `url_oferta` + mismo `fuente_id` → no insertar
- Secundario (fallback): `titulo` + `empresa` + `fecha_publicacion` → no insertar

**Reglas de búsqueda:**
- `q` busca en `titulo`, `empresa`, `descripcion`
- Índices: `fuente_id`, `fecha_publicacion`, `modalidad`

**Borrado:**
- MVP: no DELETE físico de empleos con postulaciones (fase futura)
- Archivado lógico: columna `empleo.activo` (Fase 5 ✅)

**Bizagi:** O2, O3, S5 | **Mockup:** marketplace, detalle

---

### 2.3 `perfil`

| Campo | Restricción |
|-------|-------------|
| `email` | NOT NULL, UNIQUE |
| `habilidades` | NOT NULL; texto separado por comas (MVP) |
| `nombre` | NOT NULL |

**Reglas:**
- Un perfil por email (estudiante/egresado)
- Habilidades en minúsculas normalizadas al guardar
- Sin perfil no hay recomendaciones personalizadas (fallback a listado general)

**Relación futura con auth:**
- `perfil.usuario_id` FK → `usuario.id` (tabla planificada Fase 3)

**Bizagi:** O1 | **Mockup:** dashboard estudiante

---

### 2.4 `recomendacion`

| Campo | Restricción |
|-------|-------------|
| `perfil_id` | FK → `perfil.id`, NOT NULL |
| `empleo_id` | FK → `empleo.id`, NOT NULL |
| `puntaje` | REAL NOT NULL, rango 0–100 |
| `motivo` | Texto breve explicativo |

**Duplicados prohibidos:**
- Índice único `(perfil_id, empleo_id)` — `idx_recomendacion_perfil_empleo_unica`

**Reglas de estado:**
- Al actualizar perfil: DELETE recomendaciones del perfil + recalcular (no UPDATE parcial inconsistente)
- Empleo archivado: recomendaciones existentes permanecen; no generar nuevas

**Bizagi:** O3, S2

---

## 3. Tablas planificadas (fases futuras)

### 3.1 `usuario` (Fase 3)

| Campo | Restricción |
|-------|-------------|
| `email` | UNIQUE, NOT NULL |
| `password_hash` | NOT NULL |
| `rol` | `estudiante`, `egresado`, `administrador`, `soporte` |
| `activo` | 0/1; borrado lógico |

**Regla:** desactivar usuario no elimina perfil ni historial de postulaciones.

---

### 3.2 `postulacion` (Fase 4)

| Campo | Restricción |
|-------|-------------|
| `perfil_id` | FK → `perfil.id` |
| `empleo_id` | FK → `empleo.id` |
| `estado` | `registrada`, `en_proceso`, `cerrada` |
| `fecha_postulacion` | NOT NULL |

**Duplicados:**
- Un perfil no puede postular dos veces la misma oferta → UNIQUE `(perfil_id, empleo_id)`

**Borrado:** prohibido (historial inmutable — regla PP-04)

**Bizagi:** O4

---

### 3.3 `favorito` (Fase 4)

| Campo | Restricción |
|-------|-------------|
| `perfil_id` | FK → `perfil.id` |
| `empleo_id` | FK → `empleo.id` |
| `creado_en` | timestamp |

**Duplicados:** UNIQUE `(perfil_id, empleo_id)`

**Borrado:** permitido (quitar favorito = DELETE)

**Bizagi:** O4

---

### 3.4 `auditoria` (Fase 6)

| Campo | Restricción |
|-------|-------------|
| `usuario_id` | FK nullable (acciones de sistema) |
| `accion` | NOT NULL |
| `entidad` | tabla afectada |
| `detalle` | JSON/texto |
| `creado_en` | timestamp |

**Regla:** solo INSERT; nunca UPDATE/DELETE.

**Bizagi:** S3

---

## 4. Relaciones obligatorias

```
fuente_empleo (1) ──< (N) empleo
perfil (1) ──< (N) recomendacion >── (N) empleo
perfil (1) ──< (N) postulacion >── (N) empleo   [Fase 4]
perfil (1) ──< (N) favorito >── (N) empleo      [Fase 4]
usuario (1) ──< (1) perfil                       [Fase 3]
```

**Integridad referencial:**
- No eliminar `fuente_empleo` con empleos hijos
- No eliminar `empleo` con postulaciones (fase futura)
- No eliminar `perfil` con postulaciones activas

---

## 5. Restricciones por estados

| Entidad | Estado | Comportamiento |
|---------|--------|----------------|
| `fuente_empleo` | `activa=0` | Worker no inserta; empleos existentes visibles |
| `empleo` | archivado (futuro) | No aparece en marketplace; sí en historial postulaciones |
| `postulacion` | `cerrada` | Solo lectura |
| `usuario` | `activo=0` | No login; datos preservados |
| `recomendacion` | — | Recalculable; no editable manualmente por usuario |

---

## 6. Reglas de borrado lógico vs físico

| Tabla | DELETE físico | Borrado lógico |
|-------|---------------|----------------|
| `fuente_empleo` | ❌ Prohibido si hay empleos | `activa=0` |
| `empleo` | ❌ Prohibido si hay postulaciones | `activo=0` ✅ Fase 5 |
| `perfil` | ❌ | `activo=0` vía usuario |
| `recomendacion` | ✅ Al recalcular perfil | — |
| `postulacion` | ❌ Inmutable | Solo cambio de `estado` |
| `favorito` | ✅ Quitar favorito | — |
| `auditoria` | ❌ Append-only | — |

---

## 7. Reglas del worker sobre datos

| Regla | Descripción |
|-------|-------------|
| WK-01 | Normalizar HTML → texto antes de INSERT |
| WK-02 | Verificar dedup antes de INSERT |
| WK-03 | Asignar `fuente_id` de Remotive automáticamente |
| WK-04 | No UPDATE masivo destructivo; preferir skip en duplicados |
| WK-05 | Registrar conteo: insertados, duplicados, errores (log) |

**Ubicación:** `workers/recolector/src/recolector/repositorio.py`

---

## 8. Índices — criterio de creación

**Existentes (mantener):**
- `idx_empleo_fuente_id`
- `idx_empleo_fecha_publicacion`
- `idx_empleo_modalidad`
- `idx_recomendacion_perfil_id`
- `idx_recomendacion_empleo_id`
- `idx_recomendacion_perfil_empleo_unica`

**Planificados:**
- `idx_postulacion_perfil_id` (Fase 4)
- `idx_favorito_perfil_id` (Fase 4)
- `idx_usuario_email` UNIQUE (Fase 3)

**No crear** índices especulativos sin query real.

---

## 9. Migraciones

**Estado actual:** migraciones incrementales en `database/migrations/` (003 auth, 004 postulaciones/favoritos, 005 admin).

**Regla a partir de Fase 2:**
```
database/migrations/
  001_initial.sql          ← equivalente a schema.sql
  002_add_usuario.sql      ← Fase 3
  004_postulacion_favorito.sql
  005_admin_empleo_activo.sql   ← Fase 5
```

Cada migración: idempotente donde sea posible; numerada secuencialmente.

---

## 10. Checklist de validación por módulo

| Operación | Validación DB |
|-----------|---------------|
| Insertar empleo (worker) | FK fuente válida, dedup url |
| Listar empleos | Solo `activo=1` cuando exista columna |
| Guardar perfil | email unique, habilidades not null |
| Calcular recomendación | perfil y empleo existen; upsert con unique index |
| Postular | unique perfil+empleo; empleo activo |
| Guardar favorito | unique perfil+empleo |

---

## Referencias

- Modelo completo: `docs/05-modelo-datos.md`
- Recolección: `docs/07-recoleccion-empleos.md`
- Reglas negocio: `SYSTEM_RULES.md`
- Módulos: `MODULES.md`
