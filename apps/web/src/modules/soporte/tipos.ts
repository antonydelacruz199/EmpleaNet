export type MotorConfig = {
  habilidades: number;
  carrera: number;
  intereses: number;
  experiencia: number;
  modalidad: number;
  ubicacion: number;
  /** @deprecated */
  actualidad?: number;
  actualizadoEn: string;
  total: number;
};

export type MotorConfigInput = {
  habilidades: number;
  carrera: number;
  intereses: number;
  experiencia: number;
  modalidad: number;
  ubicacion: number;
};

export type Incidencia = {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: "abierta" | "en_proceso" | "cerrada";
  creadoEn: string;
  reportadoPor?: string;
};

export type RegistroAuditoria = {
  id: string;
  usuarioId: string | null;
  accion: string;
  entidad: string | null;
  detalle: string | null;
  creadoEn: string;
};

export type RecalcularMotorResult = {
  perfilesRecalculados: number;
};
