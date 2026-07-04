# Reglas del sistema — Continental Oportunidades

Reglas de negocio y restricciones funcionales alineadas con procesos Bizagi (`/bizagi`), documentación canónica y alcance de tesis de la Universidad Continental.

---

## 1. Reglas de negocio clave

### RB-01 — Centralización institucional
Toda oferta visible en Continental Oportunidades debe existir en la base local (`empleo`) con trazabilidad de fuente (`fuente_empleo`). No se muestran enlaces externos sin registro previo.

**Bizagi:** O2, S5 | **Mockup:** marketplace, detalle

### RB-02 — Enlace original obligatorio
Cada oferta debe conservar `url_oferta` apuntando al portal de origen. La postulación en portales externos se realiza **fuera** del sistema (redirección), salvo ofertas institucionales manuales.

**Bizagi:** O4 | **Mockup:** detalle de oportunidad

### RB-03 — Recomendación explicable
Toda recomendación debe incluir `puntaje` numérico y `motivo` textual breve. No se usan cajas negras ni ML en el MVP.

**Bizagi:** O3, S2 | **Doc:** `docs/08-motor-recomendacion.md`

### RB-04 — Perfil como insumo del motor
El motor de recomendación solo opera sobre perfiles con datos mínimos: habilidades y preferencia de ubicación/modalidad. Sin perfil completo, se muestran ofertas generales ordenadas por fecha.

**Bizagi:** O1, O3

### RB-05 — Deduplicación de ofertas
No se publican duplicados de la misma oferta. Criterio primario: `url_oferta` por fuente. Secundario: título + empresa.

**Bizagi:** S5, O2 | **Doc:** `docs/05-modelo-datos.md` §12.3

### RB-06 — Separación de roles
Estudiante/egresado no gestiona ofertas ni reportes institucionales. Administrador no modifica parámetros técnicos del motor. Soporte no publica ofertas salvo delegación explícita.

**Bizagi:** O1–O5, S2–S4

---

## 2. Restricciones funcionales

| ID | Restricción | Fuente |
|----|-------------|--------|
| RF-01 | Una sola fuente externa activa en Fase 2.3: **Remotive API** | `docs/07-recoleccion-empleos.md` |
| RF-02 | Sin scraping HTML en fase inicial | `docs/07-recoleccion-empleos.md` |
| RF-03 | Sin postulación automática en portales de terceros | `docs/02-alcance-funcional.md` |
| RF-04 | Sin app móvil en MVP | `docs/02-alcance-funcional.md` |
| RF-05 | Cálculo de recomendación solo en backend | `docs/08-motor-recomendacion.md` |
| RF-06 | Un solo cliente HTTP en frontend | `docs/09-reglas-codigo.md` |
| RF-07 | API pública Remotive: asumir retraso ~24 h | `docs/00-estado-actual.md` |
| RF-08 | No redistribuir ofertas Remotive fuera de términos de uso | `docs/07-recoleccion-empleos.md` |

---

## 3. Reglas de autenticación

> **Estado actual:** no implementado. Reglas definidas para Fase 3.

### AU-01 — Roles del sistema
| Rol | Permisos |
|-----|----------|
| `estudiante` | Perfil propio, búsqueda, recomendaciones, postulaciones, favoritos |
| `egresado` | Igual que estudiante |
| `administrador` | Gestión ofertas manuales, reportes, usuarios (lectura) |
| `soporte` | Config. motor, incidencias, mantenimiento (sin gestión académica) |

**Bizagi:** O1, S3 | **Mockup:** inicio de sesión

### AU-02 — Validación de credenciales
Credenciales inválidas → acceso denegado sin revelar si el usuario existe (S3).

### AU-03 — Sesión protegida
Rutas `/admin/*` y `/soporte/*` requieren rol correspondiente. API valida token/sesión en cada request mutante.

### AU-04 — Exclusiones MVP auth
- SSO LDAP institucional → fase futura
- MFA → fuera de alcance tesis

---

## 4. Reglas de publicación de ofertas

### PO-01 — Dos vías de ingreso (O2)
1. **Manual:** administrador registra oferta institucional o convenio.
2. **Automática:** worker importa desde Remotive (S5).

Ambas convergen en validación antes de publicación.

### PO-02 — Validación obligatoria
Campos mínimos: `titulo`, `empresa`, `fuente_id`. Oferta inválida → rechazada, no publicada (gateway O2).

### PO-03 — Clasificación
Toda oferta publicada debe tener `modalidad` (remoto/presencial/híbrido) y `ubicacion` cuando aplique.

### PO-04 — Normalización de contenido
Descripción sin HTML crudo. Texto limpio apto para búsqueda (`q`).

### PO-05 — Cierre de ofertas
Ofertas vencidas se marcan inactivas (archivado lógico); no se eliminan físicamente si tienen postulaciones asociadas (fase futura).

**Mockup:** gestión de ofertas administrador

---

## 5. Reglas de postulación

> **Estado actual:** no implementado. Proceso O4.

### PP-01 — Flujo postulación
1. Usuario visualiza detalle (O4 t1).
2. Elige postular o guardar favorito (gateway O4).
3. Si postula: verificación de requisitos mínimos (perfil vs oferta).
4. Si cumple: registro de postulación + confirmación + historial.

### PP-02 — Requisitos mínimos
En MVP: perfil con al menos una habilidad registrada. Requisitos específicos por oferta → fase posterior.

### PP-03 — Postulación externa
Al confirmar postulación en oferta externa, el sistema registra la intención y redirige a `url_oferta`. No simula envío de CV al portal externo.

### PP-04 — Historial inmutable
Una postulación registrada no se borra; solo cambia de estado (`registrada`, `en_proceso`, `cerrada`).

**Bizagi:** O4

---

## 6. Reglas de recomendación

Basadas en `docs/08-motor-recomendacion.md` y proceso S2/O3.

### RC-01 — Motor por reglas (no ML)
Variables: habilidades (30%), carrera (25%), experiencia (15%), modalidad (15%), ubicación (10%), actualidad (5%).

### RC-02 — Ejecución en backend
El frontend consume resultados ordenados; no calcula puntajes.

### RC-03 — Un score por par perfil-empleo
Combinación `(perfil_id, empleo_id)` única en tabla `recomendacion`.

### RC-04 — Recálculo
Al actualizar perfil, se invalidan recomendaciones previas y se recalculan (S2: ajuste y optimización).

### RC-05 — Ordenamiento
Resultados presentados por relevancia descendente (O3 t6-t7).

**Mockups:** dashboard estudiante, configuración motor (soporte)

---

## 7. Reglas de auditoría

> **Estado actual:** parcial (logs API). Auditoría formal pendiente Fase 6.

### AD-01 — Registro de accesos
Login exitoso/fallido registrado con timestamp y rol (S3).

### AD-02 — Trazabilidad de cambios admin
Creación/edición/cierre de ofertas manuales auditada (usuario, fecha, acción).

### AD-03 — Bitácora de worker
Cada ejecución del recolector registra: ofertas nuevas, duplicadas, rechazadas, errores (S5, S1).

### AD-04 — Protección de datos personales
Datos de perfil accesibles solo al titular y roles autorizados (S3).

### AD-05 — Respaldo
Copias de seguridad periódicas de SQLite en entorno institucional (S3) — Fase 6.

**Bizagi:** S3, E2 (monitoreo)

---

## Referencias cruzadas

| Regla | BPMN | Mockup | Doc canónico |
|-------|------|--------|--------------|
| Publicación ofertas | O2, S5 | gestión ofertas | `07-recoleccion-empleos.md` |
| Recomendación | O3, S2 | dashboard estudiante, config. motor | `08-motor-recomendacion.md` |
| Postulación | O4 | detalle oportunidad | `02-alcance-funcional.md` |
| Seguridad | S3 | inicio sesión | `04-seguridad.md` |
| Reportes | O5 | dashboard reportes | `IMPLEMENTATION_AUDIT.md` |
