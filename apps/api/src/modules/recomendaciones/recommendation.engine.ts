/**
 * Motor de recomendación O3 — reglas ponderadas defendibles para tesis.
 * Pesos base: habilidades 35%, carrera 25%, intereses 15%, modalidad 10%,
 * ubicación 10%, experiencia 5%.
 */

export type PesosMotor = {
  habilidades: number;
  carrera: number;
  intereses: number;
  modalidad: number;
  ubicacion: number;
  experiencia: number;
};

export const PESOS_O3: PesosMotor = {
  habilidades: 35,
  carrera: 25,
  intereses: 15,
  modalidad: 10,
  ubicacion: 10,
  experiencia: 5,
};

/** Compatibilidad Fase 6: mapea actualidad → intereses si aplica */
export type PesosMotorLegacy = PesosMotor & { actualidad?: number };

export type NivelCoincidencia = "alta" | "media" | "baja" | "no_recomendable";

export type DesglosePuntaje = {
  habilidades: number;
  carrera: number;
  intereses: number;
  modalidad: number;
  ubicacion: number;
  experiencia: number;
};

export type EntradaPerfilMotor = {
  skills: string[];
  carrera?: string;
  intereses: string[];
  location?: string;
  modalidadPreferida?: string;
  ubicacionPreferida?: string;
  anosExperiencia?: number;
  categoriasInteres?: string[];
};

export type EntradaEmpleoMotor = {
  title: string;
  descripcion?: string;
  modalidad?: string;
  ubicacion?: string;
  categoria?: string;
  tipoOportunidad?: string;
  habilidadesRequeridas?: string[];
  fechaPublicacion?: string;
};

export type ResultadoMotor = {
  puntaje: number;
  nivel: NivelCoincidencia;
  motivo: string;
  desglose: DesglosePuntaje;
  razones: string[];
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function parseLista(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => normalizar(s))
    .filter(Boolean);
}

export function interpretarNivel(puntaje: number): NivelCoincidencia {
  if (puntaje >= 80) return "alta";
  if (puntaje >= 60) return "media";
  if (puntaje >= 40) return "baja";
  return "no_recomendable";
}

export function etiquetaNivel(nivel: NivelCoincidencia): string {
  const map: Record<NivelCoincidencia, string> = {
    alta: "Alta coincidencia",
    media: "Coincidencia media",
    baja: "Coincidencia baja",
    no_recomendable: "No recomendable",
  };
  return map[nivel];
}

function textoEmpleo(empleo: EntradaEmpleoMotor) {
  return normalizar(
    `${empleo.title} ${empleo.descripcion ?? ""} ${(empleo.habilidadesRequeridas ?? []).join(" ")}`,
  );
}

function habilidadesCoincidentes(skills: string[], empleo: EntradaEmpleoMotor) {
  const cuerpo = textoEmpleo(empleo);
  const titulo = normalizar(empleo.title);
  const req = (empleo.habilidadesRequeridas ?? []).map(normalizar);
  return skills.filter(
    (skill) =>
      cuerpo.includes(skill) ||
      titulo.includes(skill) ||
      req.some((r) => r.includes(skill) || skill.includes(r)),
  );
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

function tokensCarrera(carrera?: string): string[] {
  if (!carrera) return [];
  return parseLista(carrera).flatMap((c) => c.split(/\s+/)).filter((t) => t.length > 3);
}

function puntajeCarrera(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const tokens = tokensCarrera(perfil.carrera);
  if (tokens.length === 0) {
    const fallback = perfil.skills.slice(0, 3);
    if (fallback.length === 0) return 0;
    const titulo = normalizar(empleo.title);
    const match = fallback.filter((s) => titulo.includes(s));
    return (match.length / fallback.length) * pesos.carrera * 0.6;
  }
  const cuerpo = textoEmpleo(empleo);
  const match = tokens.filter((t) => cuerpo.includes(t));
  return (match.length / tokens.length) * pesos.carrera;
}

function puntajeIntereses(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const intereses = [
    ...perfil.intereses,
    ...(perfil.categoriasInteres ?? []),
  ].map(normalizar);
  if (intereses.length === 0) return pesos.intereses * 0.3;

  const campos = [
    empleo.categoria,
    empleo.tipoOportunidad,
    empleo.title,
    empleo.descripcion,
  ]
    .filter(Boolean)
    .map((c) => normalizar(c!));

  let hits = 0;
  for (const interes of intereses) {
    if (campos.some((c) => c.includes(interes) || interes.includes(c))) {
      hits += 1;
    }
  }
  return (hits / intereses.length) * pesos.intereses;
}

function puntajeModalidad(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const pref = normalizar(
    perfil.modalidadPreferida ?? perfil.location ?? "",
  );
  const modalidad = normalizar(empleo.modalidad ?? "");
  if (!pref || !modalidad) return pesos.modalidad * 0.4;
  if (pref.includes("remot") && modalidad === "remoto") return pesos.modalidad;
  if (pref.includes("presencial") && modalidad === "presencial") return pesos.modalidad;
  if (
    (pref.includes("hibrid") || pref.includes("híbrid")) &&
    modalidad === "hibrido"
  ) {
    return pesos.modalidad;
  }
  if (pref === modalidad) return pesos.modalidad;
  if (modalidad === "hibrido") return pesos.modalidad * 0.7;
  return pesos.modalidad * 0.2;
}

function puntajeUbicacion(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const pref = normalizar(
    perfil.ubicacionPreferida ?? perfil.location ?? "",
  );
  const ubi = normalizar(empleo.ubicacion ?? "");
  if (!pref || !ubi) return pesos.ubicacion * 0.3;
  if (pref.includes("remot") && ubi.includes("remot")) return pesos.ubicacion;
  if (ubi.includes(pref) || pref.includes(ubi)) return pesos.ubicacion;
  return pesos.ubicacion * 0.25;
}

function puntajeExperiencia(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor,
) {
  const anos = perfil.anosExperiencia ?? 0;
  const tipo = normalizar(empleo.tipoOportunidad ?? "empleo");
  if (tipo === "practica" || tipo === "convenio") {
    return anos <= 2 ? pesos.experiencia : pesos.experiencia * 0.5;
  }
  if (anos >= 3) return pesos.experiencia;
  if (anos >= 1) return pesos.experiencia * 0.7;
  return pesos.experiencia * 0.4;
}

function construirRazones(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  desglose: DesglosePuntaje,
  pesos: PesosMotor,
  coincidenciasSkills: string[],
): string[] {
  const razones: string[] = [];
  if (coincidenciasSkills.length > 0) {
    razones.push(`Coinciden tus habilidades: ${coincidenciasSkills.join(", ")}`);
  }
  if (desglose.carrera >= pesos.carrera * 0.5 && perfil.carrera) {
    razones.push(`Afinidad con tu carrera (${perfil.carrera})`);
  }
  if (desglose.intereses >= pesos.intereses * 0.5 && perfil.intereses.length > 0) {
    razones.push("Alineado con tus intereses laborales");
  }
  if (desglose.modalidad >= pesos.modalidad * 0.7 && empleo.modalidad) {
    razones.push(`Modalidad ${empleo.modalidad} compatible con tu preferencia`);
  }
  if (desglose.ubicacion >= pesos.ubicacion * 0.7 && empleo.ubicacion) {
    razones.push(`Ubicación compatible (${empleo.ubicacion})`);
  }
  if (desglose.experiencia >= pesos.experiencia * 0.6) {
    razones.push("Tu nivel de experiencia encaja con la oportunidad");
  }
  if (razones.length === 0) {
    razones.push("Coincidencia general con tu perfil académico-profesional");
  }
  return razones;
}

export function calcularRecomendacion(
  perfil: EntradaPerfilMotor,
  empleo: EntradaEmpleoMotor,
  pesos: PesosMotor = PESOS_O3,
): ResultadoMotor {
  const skills = perfil.skills.map(normalizar).filter(Boolean);
  const perfilNorm: EntradaPerfilMotor = {
    ...perfil,
    skills,
    intereses: perfil.intereses.map(normalizar).filter(Boolean),
  };

  const desglose: DesglosePuntaje = {
    habilidades: puntajeHabilidades(skills, empleo, pesos),
    carrera: puntajeCarrera(perfilNorm, empleo, pesos),
    intereses: puntajeIntereses(perfilNorm, empleo, pesos),
    modalidad: puntajeModalidad(perfilNorm, empleo, pesos),
    ubicacion: puntajeUbicacion(perfilNorm, empleo, pesos),
    experiencia: puntajeExperiencia(perfilNorm, empleo, pesos),
  };

  const puntaje =
    Math.round(
      (desglose.habilidades +
        desglose.carrera +
        desglose.intereses +
        desglose.modalidad +
        desglose.ubicacion +
        desglose.experiencia) *
        10,
    ) / 10;

  const coincidencias = habilidadesCoincidentes(skills, empleo);
  const razones = construirRazones(
    perfilNorm,
    empleo,
    desglose,
    pesos,
    coincidencias,
  );
  const nivel = interpretarNivel(puntaje);
  const motivo = razones.join(". ") + ".";

  return { puntaje, nivel, motivo, desglose, razones };
}

export function normalizarPesos(raw: PesosMotorLegacy): PesosMotor {
  const intereses = raw.intereses ?? raw.actualidad ?? PESOS_O3.intereses;
  return {
    habilidades: raw.habilidades,
    carrera: raw.carrera,
    intereses,
    modalidad: raw.modalidad,
    ubicacion: raw.ubicacion,
    experiencia: raw.experiencia,
  };
}

/** @deprecated Usar calcularRecomendacion desde recommendation.engine.ts */
export { PESOS_O3 as PESOS_DEFAULT };
