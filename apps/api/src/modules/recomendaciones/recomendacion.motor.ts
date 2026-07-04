/**
 * Motor de recomendación por reglas (docs/08-motor-recomendacion.md).
 * Ponderación total: 100 puntos.
 */

const PESOS = {
  habilidades: 30,
  carrera: 25,
  experiencia: 15,
  modalidad: 15,
  ubicacion: 10,
  actualidad: 5,
} as const;

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

function puntajeHabilidades(skills: string[], empleo: EntradaEmpleoMotor) {
  if (skills.length === 0) return 0;
  const coincidencias = habilidadesCoincidentes(skills, empleo);
  return (coincidencias.length / skills.length) * PESOS.habilidades;
}

function puntajeCarrera(skills: string[], empleo: EntradaEmpleoMotor) {
  if (skills.length === 0) return 0;
  const titulo = normalizar(empleo.title);
  const enTitulo = skills.filter((skill) => titulo.includes(skill));
  return (enTitulo.length / skills.length) * PESOS.carrera;
}

/** Baseline hasta contar con campo de experiencia en perfil. */
function puntajeExperiencia() {
  return PESOS.experiencia * 0.5;
}

function preferenciaModalidad(location?: string) {
  const loc = normalizar(location ?? "");
  if (loc.includes("remoto")) return "remoto";
  if (loc.includes("hibrid") || loc.includes("híbrid")) return "hibrido";
  if (loc.includes("presencial")) return "presencial";
  return undefined;
}

function puntajeModalidad(perfil: EntradaPerfilMotor, empleo: EntradaEmpleoMotor) {
  const pref = preferenciaModalidad(perfil.location);
  const modalidad = normalizar(empleo.modalidad ?? "");
  if (!pref || !modalidad) return PESOS.modalidad * 0.4;
  if (pref === modalidad) return PESOS.modalidad;
  if (modalidad === "hibrido" && (pref === "remoto" || pref === "presencial")) {
    return PESOS.modalidad * 0.6;
  }
  return 0;
}

function puntajeUbicacion(perfil: EntradaPerfilMotor, empleo: EntradaEmpleoMotor) {
  const pref = normalizar(perfil.location ?? "");
  const ubi = normalizar(empleo.ubicacion ?? "");
  if (!pref || !ubi) return 0;
  if (pref.includes("remoto") && ubi.includes("remot")) return PESOS.ubicacion;
  if (ubi.includes(pref) || pref.includes(ubi)) return PESOS.ubicacion;
  return PESOS.ubicacion * 0.3;
}

function puntajeActualidad(fechaPublicacion?: string) {
  if (!fechaPublicacion) return PESOS.actualidad * 0.5;
  const fecha = new Date(fechaPublicacion);
  if (Number.isNaN(fecha.getTime())) return PESOS.actualidad * 0.5;
  const dias = (Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24);
  if (dias <= 7) return PESOS.actualidad;
  if (dias <= 30) return PESOS.actualidad * 0.8;
  if (dias <= 90) return PESOS.actualidad * 0.5;
  return PESOS.actualidad * 0.2;
}

function construirMotivo(
  coincidencias: string[],
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  puntajes: { modalidad: number; ubicacion: number },
) {
  const partes: string[] = [];
  if (coincidencias.length > 0) {
    partes.push(`Habilidades: ${coincidencias.join(", ")}`);
  }
  if (puntajes.modalidad >= PESOS.modalidad * 0.6 && empleo.modalidad) {
    partes.push(`Modalidad ${empleo.modalidad} alineada`);
  }
  if (puntajes.ubicacion >= PESOS.ubicacion * 0.6 && empleo.ubicacion) {
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
): ResultadoMotor {
  const skills = perfil.skills.map(normalizar).filter(Boolean);
  const perfilNorm = { ...perfil, skills };

  const ph = puntajeHabilidades(skills, empleo);
  const pc = puntajeCarrera(skills, empleo);
  const pe = puntajeExperiencia();
  const pm = puntajeModalidad(perfilNorm, empleo);
  const pu = puntajeUbicacion(perfilNorm, empleo);
  const pa = puntajeActualidad(empleo.fechaPublicacion);

  const puntaje = Math.round((ph + pc + pe + pm + pu + pa) * 10) / 10;
  const coincidencias = habilidadesCoincidentes(skills, empleo);
  const motivo = construirMotivo(coincidencias, perfilNorm, empleo, {
    modalidad: pm,
    ubicacion: pu,
  });

  return { puntaje, motivo };
}
