export type EmpleoAdmin = {
  id: string;
  title: string;
  company: string;
  location?: string;
  modalidad?: "remoto" | "presencial" | "hibrido" | string;
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
  fuenteNombre?: string;
  activo: boolean;
  creadoEn?: string;
};

export type ListEmpleosAdminResult = {
  empleos: EmpleoAdmin[];
  total: number;
};

export type CreateEmpleoAdminInput = {
  title: string;
  company: string;
  location?: string;
  modalidad?: "remoto" | "presencial" | "hibrido";
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
};

export type UpdateEmpleoAdminInput = Partial<CreateEmpleoAdminInput>;

export type OfertasPorFuente = {
  fuente: string;
  total: number;
};

export type ReportesResumen = {
  usuariosActivos: number;
  ofertasPublicadas: number;
  ofertasPorFuente: OfertasPorFuente[];
  recomendacionesGeneradas: number;
  postulacionesRegistradas: number;
  favoritosGuardados: number;
};
