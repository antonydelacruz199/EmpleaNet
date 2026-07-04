/**
 * Motor de recomendación por reglas (docs/08-motor-recomendacion.md).
 * Ponderación configurable vía tabla motor_config (Fase 6).
 */

export type PesosMotor = {
  habilidades: number;
  carrera: number;
  experiencia: number;
  modalidad: number;
  ubicacion: number;
  actualidad: number;
};

export const PESOS_DEFAULT: PesosMotor = {
  habilidades: 30,
  carrera: 25,
  experiencia: 15,
  modalidad: 15,
  ubicacion: 10,
  actualidad: 5,
};

export type EntradaPerfilMotor = {
  skills: string[];
  location?: string;
};

export type EntradaEmpleoMotor = {
  title: string;
  descripcion?: string;
  modalidad?: string;
  ubicacion?: string;
  fechaPublicacion?: string;
};

export type ResultadoMotor = {
  puntaje: number;
  motivo: string;
};

function normalizar(texto: string) {
  return texto.toLowerCase().trim();
}

function textoEmpleo(empleo: EntradaEmpleoMotor) {
  return normalizar(`${empleo.title} ${empleo.descripcion ?? ""}`);
}

function habilidadesCoincidentes(skills: string[], empleo: EntradaEmpleoMotor) {
  const cuerpo = textoEmpleo(empleo);
  const titulo = normalizar(empleo.title);
  return skills.filter((skill) => cuerpo.includes(skill) || titulo.includes(skill));
}

function puntajeHabilidades(
  skills: string[],
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  if (skills.length === 0) return 0;
  const coincidencias = habilidadesCoincidentes(skills, empleo);
  return (coincidencias.length / skills.length) * pesos.habilidades;
}

function puntajeCarrera(skills: string[], empleo: EntradaEmpleoMotor, pesos: PesosMotor) {
  if (skills.length === 0) return 0;
  const titulo = normalizar(empleo.title);
  const enTitulo = skills.filter((skill) => titulo.includes(skill));
  return (enTitulo.length / skills.length) * pesos.carrera;
}

function puntajeExperiencia(pesos: PesosMotor) {
  return pesos.experiencia * 0.5;
}

function preferenciaModalidad(location?: string) {
  const loc = normalizar(location ?? "");
  if (loc.includes("remoto")) return "remoto";
  if (loc.includes("hibrid") || loc.includes("híbrid")) return "hibrido";
  if (loc.includes("presencial")) return "presencial";
  return undefined;
}

function puntajeModalidad(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const pref = preferenciaModalidad(perfil.location);
  const modalidad = normalizar(empleo.modalidad ?? "");
  if (!pref || !modalidad) return pesos.modalidad * 0.4;
  if (pref === modalidad) return pesos.modalidad;
  if (modalidad === "hibrido" && (pref === "remoto" || pref === "presencial")) {
    return pesos.modalidad * 0.6;
  }
  return 0;
}

function puntajeUbicacion(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const pref = normalizar(perfil.location ?? "");
  const ubi = normalizar(empleo.ubicacion ?? "");
  if (!pref || !ubi) return 0;
  if (pref.includes("remoto") && ubi.includes("remot")) return pesos.ubicacion;
  if (ubi.includes(pref) || pref.includes(ubi)) return pesos.ubicacion;
  return pesos.ubicacion * 0.3;
}

function puntajeActualidad(fechaPublicacion: string | undefined, pesos: PesosMotor) {
  if (!fechaPublicacion) return pesos.actualidad * 0.5;
  const fecha = new Date(fechaPublicacion);
  if (Number.isNaN(fecha.getTime())) return pesos.actualidad * 0.5;
  const dias = (Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24);
  if (dias <= 7) return pesos.actualidad;
  if (dias <= 30) return pesos.actualidad * 0.8;
  if (dias <= 90) return pesos.actualidad * 0.5;
  return pesos.actualidad * 0.2;
}

function construirMotivo(
  coincidencias: string[],
  empleo: EntradaEmpleoMotor,
  puntajes: { modalidad: number; ubicacion: number },
  pesos: PesosMotor,
) {
  const partes: string[] = [];
  if (coincidencias.length > 0) {
    partes.push(`Habilidades: ${coincidencias.join(", ")}`);
  }
  if (puntajes.modalidad >= pesos.modalidad * 0.6 && empleo.modalidad) {
    partes.push(`Modalidad ${empleo.modalidad} alineada`);
  }
  if (puntajes.ubicacion >= pesos.ubicacion * 0.6 && empleo.ubicacion) {
    partes.push(`Ubicación compatible (${empleo.ubicacion})`);
  }
  if (partes.length === 0) {
    return "Coincidencia general con tu perfil académico-profesional.";
  }
  return partes.join(". ") + ".";
}

export function calcularRecomendacion(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor = PESOS_DEFAULT,
): ResultadoMotor {
  const skills = perfil.skills.map(normalizar).filter(Boolean);
  const perfilNorm = { ...perfil, skills };

  const ph = puntajeHabilidades(skills, empleo, pesos);
  const pc = puntajeCarrera(skills, empleo, pesos);
  const pe = puntajeExperiencia(pesos);
  const pm = puntajeModalidad(perfilNorm, empleo, pesos);
  const pu = puntajeUbicacion(perfilNorm, empleo, pesos);
  const pa = puntajeActualidad(empleo.fechaPublicacion, pesos);

  const puntaje = Math.round((ph + pc + pe + pm + pu + pa) * 10) / 10;
  const coincidencias = habilidadesCoincidentes(skills, empleo);
  const motivo = construirMotivo(coincidencias, empleo, { modalidad: pm, ubicacion: pu }, pesos);

  return { puntaje, motivo };
}
