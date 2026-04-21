# Motor de recomendación - EmpleaNet

## Objetivo
Mostrar ofertas laborales relevantes según el perfil del usuario.

## Primera versión
La primera versión del motor será basada en reglas y puntajes.

## Variables iniciales sugeridas
- coincidencia de carrera
- coincidencia de habilidades
- coincidencia de experiencia
- coincidencia de modalidad
- coincidencia de ubicación
- actualidad de la oferta

## Ejemplo de ponderación inicial
- habilidades: 30
- carrera: 25
- experiencia: 15
- modalidad: 15
- ubicación: 10
- actualidad: 5

## Resultado
El sistema devuelve un puntaje total y una explicación breve de por qué el empleo fue recomendado.

## Reglas
- el cálculo debe vivir en backend
- el frontend solo consume el resultado
- no duplicar la lógica del score en varios módulos
- no implementar machine learning en esta fase
- mantener el algoritmo claro y defendible