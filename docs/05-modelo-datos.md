# Modelo de datos - EmpleaNet

## 1. Propósito del modelo de datos

El modelo de datos de EmpleaNet define la estructura mínima y necesaria para soportar el funcionamiento actual del sistema y permitir su crecimiento por fases sin caer en sobreingeniería.

En esta etapa del proyecto, el modelo está orientado a:

- almacenar fuentes de empleo
- almacenar ofertas laborales normalizadas
- almacenar perfiles básicos de usuario
- almacenar resultados de recomendación
- permitir búsqueda, filtrado y paginación en el módulo `empleos`
- preparar el ingreso de datos externos desde una fuente real

### Fase 2.3 (próxima): Remotive como única fuente
- El ingreso real de ofertas externas comienza con **Remotive API** (no otra fuente, no varias en paralelo).
- No implica cambio de tablas obligatorio: `fuente_empleo` + `empleo` absorben ofertas normalizadas; sin scraping HTML en esta fase.
- No se amplía en esta fase el alcance de `perfil`, `recomendaciones` ni `auth`.

El objetivo principal del modelo es mantener una base simple, clara y consistente, lista para integrarse con:

- la API en Node.js + Express + TypeScript
- SQLite como base de datos inicial
- el worker de recolección en Python
- el frontend en React

---

## 2. Principios de diseño del modelo

El diseño del modelo de datos sigue estos principios:

### 2.1. Simplicidad
Solo se crean tablas y campos que aportan valor directo al alcance actual del proyecto.

### 2.2. Evolución por fases
El modelo está preparado para crecer de manera incremental, sin intentar anticipar todos los casos futuros desde la primera versión.

### 2.3. Separación de responsabilidades
Cada tabla representa una responsabilidad clara:
- fuente
- empleo
- perfil
- recomendación

### 2.4. Soporte al módulo prioritario
En la etapa actual, el módulo prioritario es `empleos`, por lo que el modelo se enfoca principalmente en permitir:
- persistencia real
- búsqueda
- filtrado
- paginación
- futura importación desde fuentes externas

### 2.5. Compatibilidad con normalización
Los datos provenientes de fuentes externas deben transformarse y adaptarse a este modelo antes de persistirse.

### 2.6. Preparación para deduplicación
Aunque la deduplicación avanzada aún no está cerrada como fase, el modelo ya permite implementar estrategias básicas de control de duplicados a nivel de lógica del worker o del repository.

---

## 3. Motor de base de datos actual

La base de datos actual del proyecto usa:

- **SQLite**

## Razones de la elección
SQLite se eligió para la etapa actual porque:

- permite una implementación rápida y controlada
- simplifica el desarrollo local
- reduce complejidad operativa
- es suficiente para el MVP técnico inicial
- encaja bien con el flujo actual de EmpleaNet

## Consideraciones
SQLite es el motor inicial, no necesariamente el definitivo.  
En una fase futura, el sistema podría migrarse a otro motor si el crecimiento del proyecto lo exige.

---

## 4. Entidades principales del sistema

Actualmente el modelo de datos de EmpleaNet se compone de estas entidades principales:

1. `fuente_empleo`
2. `empleo`
3. `perfil`
4. `recomendacion`

---

# 5. Tabla: fuente_empleo

## 5.1. Propósito
La tabla `fuente_empleo` representa una fuente externa desde donde se obtienen ofertas laborales.

Esta tabla permite:
- identificar el origen de cada empleo
- distinguir entre fuentes activas e inactivas
- registrar información básica de integración
- preparar el sistema para múltiples fuentes futuras

## 5.2. Campos principales

### `id`
Identificador único de la fuente.

### `nombre`
Nombre de la fuente de empleo.

Ejemplos:
- Remotive
- Greenhouse
- Lever
- Portal interno

### `tipo`
Tipo de fuente.

Ejemplos:
- api
- rss
- html
- manual

### `url`
URL base o referencia principal de la fuente.

### `activa`
Indica si la fuente está activa para el sistema.

### `creado_en`
Fecha de creación del registro.

## 5.3. Uso actual
Actualmente esta tabla ya existe en el esquema y permite registrar fuentes base para el sistema.

## 5.4. Regla importante
Todo empleo persistido debe estar asociado a una fuente válida mediante `fuente_id`.

---

# 6. Tabla: empleo

## 6.1. Propósito
La tabla `empleo` es la entidad central del sistema en la fase actual.

Representa una oferta laboral normalizada que podrá:
- ser listada
- ser filtrada
- ser consultada por detalle
- ser usada por el motor de recomendación
- ser importada desde fuentes externas

## 6.2. Campos principales

### `id`
Identificador único del empleo.

### `fuente_id`
Referencia a la fuente de empleo de donde proviene la oferta.

### `titulo`
Título principal del empleo.

Ejemplos:
- Desarrollador Frontend React
- Ingeniero Backend Node.js
- Analista de Datos

### `empresa`
Nombre de la empresa u organización que publica la oferta.

### `ubicacion`
Ubicación del empleo.

Ejemplos:
- Remoto
- Lima
- Madrid
- Barcelona

### `modalidad`
Modalidad de trabajo del empleo.

Valores esperados a nivel de contenido:
- remoto
- presencial
- hibrido

## Nota
No se está imponiendo todavía una restricción rígida por base de datos tipo ENUM, porque en SQLite eso complica innecesariamente la fase actual.  
La normalización y validación se manejan desde la lógica de la aplicación.

### `descripcion`
Descripción del empleo.

Debe contener el texto útil y normalizado de la oferta, evitando HTML innecesario.

### `url_oferta`
Enlace original de la oferta laboral.

Este campo es muy importante porque:
- conserva la referencia original
- permite redirigir al usuario
- respeta el origen del contenido
- facilita trazabilidad de la fuente

### `salario`
Salario o rango salarial, si la fuente lo proporciona.

### `fecha_publicacion`
Fecha de publicación del empleo en la fuente original o en el formato entregado por la fuente.

### `creado_en`
Fecha de creación del registro en la base de datos local.

## 6.3. Uso actual
Esta tabla ya es usada por el módulo `empleos` para:

- `GET /api/empleos`
- `GET /api/empleos/:id`

y ya soporta filtros y paginación en backend.

## 6.4. Regla de normalización
Todo empleo ingresado por fuentes externas debe transformarse al formato de esta tabla antes de guardarse.

## 6.5. Regla de búsqueda
Los datos almacenados aquí deben ser aptos para:
- búsqueda por texto
- filtrado por ubicación
- filtrado por modalidad
- filtrado por fuente
- paginación

---

# 7. Tabla: perfil

## 7.1. Propósito
La tabla `perfil` representa el perfil básico del usuario que se utilizará posteriormente para generar recomendaciones.

## 7.2. Campos principales

### `id`
Identificador único del perfil.

### `nombre`
Nombre del usuario.

### `email`
Correo del usuario.

Actualmente debe ser único.

### `ubicacion`
Ubicación del usuario o ubicación de preferencia.

### `habilidades`
Conjunto de habilidades del usuario.

Actualmente se está manejando de forma simple como texto.

Ejemplo:
- `typescript,react,nodejs`

## 7.3. Estado actual
La tabla ya existe en el modelo, pero el módulo `perfil` todavía no está implementado funcionalmente como fase cerrada.

## 7.4. Razón de esta simplicidad actual
Se mantiene simple porque aún no es la fase de cierre del módulo `perfil`.  
No conviene introducir aún:
- tablas intermedias complejas
- catálogos de habilidades
- relaciones avanzadas

Eso podrá revisarse cuando el módulo `perfil` entre en desarrollo real.

---

# 8. Tabla: recomendacion

## 8.1. Propósito
La tabla `recomendacion` representa la afinidad calculada entre un perfil y un empleo.

## 8.2. Campos principales

### `id`
Identificador único de la recomendación.

### `perfil_id`
Perfil al que corresponde la recomendación.

### `empleo_id`
Empleo recomendado.

### `puntaje`
Valor numérico de afinidad entre el perfil y el empleo.

### `motivo`
Explicación breve de por qué se generó la recomendación.

### `creado_en`
Fecha de creación del registro.

## 8.3. Estado actual
La tabla ya existe para mantener alineado el modelo futuro, pero el módulo de recomendaciones todavía no está implementado como fase funcional.

## 8.4. Regla futura
Una misma combinación `(perfil_id, empleo_id)` no debe repetirse innecesariamente.  
Por ello ya se recomienda o se usa un índice único para esa combinación.

---

# 9. Relaciones entre entidades

## 9.1. fuente_empleo -> empleo
Una fuente de empleo puede tener muchos empleos.

Relación:
- `fuente_empleo.id` -> `empleo.fuente_id`

## 9.2. perfil -> recomendacion
Un perfil puede tener muchas recomendaciones.

Relación:
- `perfil.id` -> `recomendacion.perfil_id`

## 9.3. empleo -> recomendacion
Un empleo puede formar parte de muchas recomendaciones.

Relación:
- `empleo.id` -> `recomendacion.empleo_id`

---

# 10. Reglas de integridad

## 10.1. Claves foráneas
El sistema activa `PRAGMA foreign_keys = ON` en SQLite para respetar las relaciones declaradas.

## 10.2. Coherencia de fuente
Todo empleo debe estar vinculado a una fuente válida.

## 10.3. Coherencia de recomendación
Toda recomendación debe referenciar:
- un perfil existente
- un empleo existente

## 10.4. Coherencia de URL
Cuando el empleo provenga de una fuente externa, debe conservar su `url_oferta` original siempre que esté disponible.

---

# 11. Índices y rendimiento

## 11.1. Objetivo
Los índices actuales existen para mejorar el acceso en el uso real del sistema sin introducir complejidad excesiva.

## 11.2. Índices relevantes
Actualmente se contemplan o se usan índices básicos como:

- índice por `empleo.fuente_id`
- índice por `empleo.fecha_publicacion`
- índice por `empleo.modalidad`
- índice por `recomendacion.perfil_id`
- índice por `recomendacion.empleo_id`
- índice único por `(perfil_id, empleo_id)` en `recomendacion`

## 11.3. Criterio de uso
No se deben crear índices en exceso en esta etapa.  
Solo deben existir los necesarios para:
- filtros reales
- relaciones base
- evitar duplicados lógicos importantes

---

# 12. Reglas de modelado para fuentes externas

Esta sección es especialmente importante para la siguiente fase del proyecto.

## 12.1. Fuente inicial obligatoria
La primera integración real del worker será con **Remotive API**.

## 12.2. Reglas de persistencia para esa integración
Toda oferta importada desde Remotive deberá:
- registrarse con una fuente válida en `fuente_empleo`
- conservar su `url_oferta`
- persistirse ya normalizada en la tabla `empleo`
- incluir `modalidad` cuando sea posible
- mantener una estructura apta para búsqueda y filtrado

## 12.3. Regla de deduplicación inicial
Antes de insertar ofertas desde la fuente externa, el sistema debe aplicar una deduplicación básica.

La deduplicación puede basarse inicialmente en uno o más de estos criterios:
- `url_oferta`
- combinación de `titulo + empresa`
- combinación de `titulo + empresa + fecha_publicacion`

## 12.4. Regla de contenido
No se debe guardar HTML crudo innecesario.  
La descripción debe persistirse en un formato limpio y útil para la API y la búsqueda.

---

# 13. Soporte para filtros en el módulo empleos

El modelo actual ya está alineado con filtros reales en backend.

## Filtros esperados
El endpoint `GET /api/empleos` debe poder trabajar con:

- `q`
- `ubicacion`
- `modalidad`
- `fuente`
- `page`
- `limit`

## Campos del modelo que soportan esos filtros
- `titulo`
- `empresa`
- `descripcion`
- `ubicacion`
- `modalidad`
- `fuente_id`

---

# 14. Estado actual del modelo

## Implementado
Actualmente el modelo ya soporta:

- persistencia real en SQLite
- listado real de empleos
- detalle por id
- filtros reales en backend
- paginación básica
- preparación para ingreso de datos externos

## Pendiente
Todavía falta desarrollar sobre este modelo:

- integración real del worker con Remotive API
- módulo `perfil`
- módulo `recomendaciones`
- cierre visual completo del frontend del módulo `empleos`
- estrategia más avanzada de deduplicación si el volumen crece

---

# 15. Límites actuales del modelo

El modelo actual es adecuado para la fase en curso, pero todavía tiene límites intencionales:

- `habilidades` en `perfil` aún es texto simple
- no existe aún una tabla específica de etiquetas o categorías de empleo
- no existe aún una tabla de histórico de recolección
- no se ha modelado todavía una auditoría detallada del worker
- no hay aún versionado avanzado de recomendaciones

Esto es intencional.  
No se agregan estructuras futuras hasta que el proyecto realmente las necesite.

---

# 16. Decisiones explícitas de no sobreingeniería

Para mantener el proyecto limpio y manejable, se decidió explícitamente no introducir todavía:

- catálogos complejos de habilidades
- tablas auxiliares para cada atributo del empleo
- un sistema complejo de deduplicación persistido en tablas adicionales
- múltiples tablas de staging
- estructuras pensadas para múltiples portales complejos antes de validar la primera fuente real
- tablas de autenticación o sesiones en esta etapa

---

# 17. Conclusión

El modelo de datos actual de EmpleaNet está diseñado para soportar correctamente la fase actual del sistema, con foco en el módulo `empleos`, persistencia real en SQLite y preparación para la siguiente integración con una fuente externa real.

Este modelo ya permite:

- almacenar empleos de forma consistente
- identificarlos por fuente
- buscarlos y filtrarlos
- exponerlos por la API
- preparar recomendaciones futuras
- integrar un worker de recolección sin mezclar responsabilidades

La regla principal del modelo sigue siendo:

**mantener una base simple, clara y evolutiva, sin caer en sobreingeniería ni duplicidad innecesaria.**