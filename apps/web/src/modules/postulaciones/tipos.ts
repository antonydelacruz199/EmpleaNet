export type EstadoPostulacion = "registrada" | "en_proceso" | "cerrada";

export type PostulacionEmpleo = {
  id: string;
  title: string;
  company: string;
  location?: string;
  modalidad?: string;
  urlOferta?: string;
  fuenteNombre?: string;
};

export type Postulacion = {
  id: string;
  empleoId: string;
  estado: EstadoPostulacion;
  fechaPostulacion: string;
  empleo?: PostulacionEmpleo;
};

export type PostulacionEstadoEmpleo = {
  postulado: boolean;
  postulacion?: Postulacion;
};

export type CrearPostulacionResult = {
  postulacion: Postulacion;
  urlOferta?: string;
};

export type ListPostulacionesResult = {
  postulaciones: Postulacion[];
  total: number;
};

export type PostulacionesResumen = {
  activas: number;
};
