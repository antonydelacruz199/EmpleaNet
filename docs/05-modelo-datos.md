# Modelo de datos - EmpleaNet

## Entidades principales

### fuente_empleo
Representa una fuente o portal desde donde se recopilan ofertas.

Campos iniciales sugeridos:
- id
- nombre
- url_base
- estado
- ultima_sincronizacion
- fecha_creacion

### empleo
Representa una oferta laboral normalizada.

Campos iniciales sugeridos:
- id
- fuente_id
- titulo
- empresa
- ubicacion
- modalidad
- descripcion
- requisitos
- url_original
- fecha_publicacion
- fecha_recoleccion
- hash_unico
- estado

### perfil
Representa el perfil del usuario para personalizar recomendaciones.

Campos iniciales sugeridos:
- id
- nombre
- correo
- carrera
- nivel_academico
- habilidades
- experiencia
- ubicacion_preferida
- modalidad_preferida
- palabras_clave
- fecha_actualizacion

### recomendacion
Representa el resultado del cálculo de afinidad entre un perfil y un empleo.

Campos iniciales sugeridos:
- id
- perfil_id
- empleo_id
- puntaje
- motivo
- fecha_calculo

## Relaciones iniciales
- una fuente puede tener muchos empleos
- un perfil puede tener muchas recomendaciones
- un empleo puede aparecer en muchas recomendaciones

## Reglas de diseño
- mantener el modelo simple
- no introducir tablas que todavía no se usarán
- deduplicar empleos por hash_unico o estrategia equivalente
- no diseñar para todos los escenarios futuros desde el inicio