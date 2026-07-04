import type { RolUsuario } from "../../core/auth/types.js";

export type DatosCompletitud = {
  nombre: string;
  telefono: string | null;
  ubicacion: string | null;
  resumen: string | null;
  carreraId: number | null;
  cicloActual: number | null;
  anioEgreso: number | null;
  rol: RolUsuario;
  skillsCount: number;
  interesesCount: number;
  experienciasCount: number;
  tieneCv: boolean;
};

export type SeccionCompletitud = {
  personal: number;
  academico: number;
  habilidades: number;
  intereses: number;
  experiencia: number;
  cv: number;
};

export type ResultadoCompletitud = {
  porcentaje: number;
  completo: boolean;
  secciones: SeccionCompletitud;
  faltantes: string[];
};

const UMBRAL_COMPLETO = 80;

export function calcularCompletitud(d: DatosCompletitud): ResultadoCompletitud {
  const faltantes: string[] = [];
  const secciones: SeccionCompletitud = {
    personal: 0,
    academico: 0,
    habilidades: 0,
    intereses: 0,
    experiencia: 0,
    cv: 0,
  };

  secciones.personal = 5;
  if (d.telefono?.trim()) secciones.personal += 5;
  else faltantes.push("Teléfono de contacto");

  if (d.ubicacion?.trim()) secciones.personal += 5;
  else faltantes.push("Ubicación o preferencia laboral");

  if (d.resumen && d.resumen.trim().length >= 20) secciones.personal += 10;
  else faltantes.push("Resumen profesional (mín. 20 caracteres)");

  if (d.carreraId) secciones.academico += 15;
  else faltantes.push("Carrera universitaria");

  if (d.rol === "estudiante") {
    if (d.cicloActual && d.cicloActual > 0) secciones.academico += 10;
    else faltantes.push("Ciclo académico actual");
  } else if (d.rol === "egresado") {
    if (d.anioEgreso && d.anioEgreso >= 1990) secciones.academico += 10;
    else faltantes.push("Año de egreso");
  }

  if (d.skillsCount >= 3) secciones.habilidades = 20;
  else if (d.skillsCount >= 1) {
    secciones.habilidades = Math.round((20 * d.skillsCount) / 3);
    faltantes.push("Al menos 3 habilidades");
  } else {
    faltantes.push("Habilidades técnicas o blandas");
  }

  if (d.interesesCount >= 2) secciones.intereses = 15;
  else if (d.interesesCount === 1) {
    secciones.intereses = 8;
    faltantes.push("Al menos 2 intereses laborales");
  } else {
    faltantes.push("Intereses laborales");
  }

  if (d.experienciasCount >= 1) secciones.experiencia = 10;
  else faltantes.push("Experiencia laboral o prácticas");

  if (d.tieneCv) secciones.cv = 5;
  else faltantes.push("Currículum vitae (CV)");

  const porcentaje = Math.min(
    100,
    secciones.personal +
      secciones.academico +
      secciones.habilidades +
      secciones.intereses +
      secciones.experiencia +
      secciones.cv,
  );

  return {
    porcentaje,
    completo: porcentaje >= UMBRAL_COMPLETO,
    secciones,
    faltantes: porcentaje >= UMBRAL_COMPLETO ? [] : faltantes,
  };
}
