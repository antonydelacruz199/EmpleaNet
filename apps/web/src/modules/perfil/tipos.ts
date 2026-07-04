export type Carrera = {
  id: string;
  nombre: string;
  area?: string;
};

export type Experiencia = {
  id: string;
  empresa: string;
  cargo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  actual: boolean;
};

export type CompletitudPerfil = {
  porcentaje: number;
  completo: boolean;
  secciones: {
    personal: number;
    academico: number;
    habilidades: number;
    intereses: number;
    experiencia: number;
    cv: number;
  };
  faltantes: string[];
};

export type PerfilDetalle = {
  id: string;
  name: string;
  email: string;
  telefono?: string;
  resumen?: string;
  location?: string;
  rol: "estudiante" | "egresado";
  carrera?: Carrera;
  cicloActual?: number;
  anioEgreso?: number;
  skills: string[];
  intereses: string[];
  experiencias: Experiencia[];
  cv?: { nombre: string; url: string };
  completitud: CompletitudPerfil;
};

export type UsuarioPerfilResumen = {
  id: string;
  email: string;
  rol: string;
  name: string;
  perfilId: string;
  completitudPct: number;
  perfilCompleto: boolean;
};
