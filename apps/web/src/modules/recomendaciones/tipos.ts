export type NivelCoincidencia = "alta" | "media" | "baja" | "no_recomendable";

export type DesglosePuntaje = {
  habilidades: number;
  carrera: number;
  intereses: number;
  modalidad: number;
  ubicacion: number;
  experiencia: number;
};

export type Recomendacion = {
  puntaje: number;
  nivel: NivelCoincidencia;
  motivo: string;
  razones: string[];
  desglose: DesglosePuntaje;
  yaPostulado?: boolean;
  empleo: import("../empleos/tipos").Empleo;
};

export type ListadoRecomendaciones = {
  recomendaciones: Recomendacion[];
  total?: number;
  perfilIncompleto?: boolean;
};

export type CoincidenciaDetalle = {
  empleoId: string;
  puntaje: number;
  nivel: NivelCoincidencia;
  motivo: string;
  razones: string[];
  desglose: DesglosePuntaje;
  yaPostulado: boolean;
};

export type PreferenciasLaborales = {
  carrera?: string;
  intereses?: string[];
  anosExperiencia?: number;
  modalidadPreferida?: "remoto" | "presencial" | "hibrido";
  ubicacionPreferida?: string;
  categoriasInteres?: string[];
  skills?: string[];
  location?: string;
};

export function etiquetaNivel(nivel: NivelCoincidencia): string {
  const map: Record<NivelCoincidencia, string> = {
    alta: "Alta coincidencia",
    media: "Coincidencia media",
    baja: "Coincidencia baja",
    no_recomendable: "No recomendable",
  };
  return map[nivel];
}

export function claseNivel(nivel: NivelCoincidencia): string {
  if (nivel === "alta") return "estado-badge estado-badge--registrada";
  if (nivel === "media") return "estado-badge estado-badge--proceso";
  return "estado-badge estado-badge--cerrada";
}
