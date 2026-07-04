export type EstadoOferta =
  | "borrador"
  | "pendiente_validacion"
  | "validada"
  | "publicada"
  | "rechazada"
  | "cerrada"
  | "archivada";

export type EmpleoAdmin = {
  id: string;
  title: string;
  company: string;
  location?: string;
  modalidad?: "remoto" | "presencial" | "hibrido" | string;
  categoria?: string;
  tipoOportunidad?: string;
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
  fechaCierre?: string;
  fuenteId?: string;
  fuenteNombre?: string;
  empresaId?: string;
  estado: EstadoOferta;
  motivoRechazo?: string;
  habilidadesRequeridas?: string[];
  activo: boolean;
  vencida?: boolean;
  creadoEn?: string;
  validadoEn?: string;
  publicadoEn?: string;
};

export type ListEmpleosAdminResult = {
  ofertas: EmpleoAdmin[];
  total: number;
};

export type OfertasResumenAdmin = {
  total: number;
  borrador: number;
  pendienteValidacion: number;
  validada: number;
  publicada: number;
  rechazada: number;
  cerrada: number;
  archivada: number;
};

export type CreateEmpleoAdminInput = {
  title: string;
  company: string;
  fuenteId: number;
  empresaId?: number;
  location?: string;
  modalidad?: "remoto" | "presencial" | "hibrido";
  categoria?:
    | "tecnologia"
    | "negocios"
    | "diseno"
    | "ingenieria"
    | "marketing"
    | "salud"
    | "otros";
  tipoOportunidad?: "empleo" | "practica" | "convenio" | "freelance";
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
  fechaCierre?: string;
  habilidadesRequeridas?: string[];
};

export type UpdateEmpleoAdminInput = Partial<CreateEmpleoAdminInput>;

export type ClasificarOfertaInput = {
  modalidad: "remoto" | "presencial" | "hibrido";
  categoria: NonNullable<CreateEmpleoAdminInput["categoria"]>;
  tipoOportunidad: NonNullable<CreateEmpleoAdminInput["tipoOportunidad"]>;
  habilidadesRequeridas: string[];
};

export type ListOfertasFiltros = {
  estado?: EstadoOferta;
  modalidad?: CreateEmpleoAdminInput["modalidad"];
  categoria?: CreateEmpleoAdminInput["categoria"];
  tipo?: CreateEmpleoAdminInput["tipoOportunidad"];
  fuente?: string;
  q?: string;
};

export type EmpresaAdmin = {
  id: string;
  nombre: string;
  sector?: string;
  contactoEmail?: string;
  activa: boolean;
};

export type FuenteAdmin = {
  id: string;
  nombre: string;
  tipo: string;
  url?: string;
  activa: boolean;
};

export type CreateEmpresaInput = {
  nombre: string;
  sector?: string;
  contactoEmail?: string;
};

export type UpdateEmpresaInput = Partial<CreateEmpresaInput & { activa: boolean }>;

export type CreateFuenteInput = {
  nombre: string;
  tipo: "manual" | "api" | "institucional" | "externa";
  url?: string;
};

export type UpdateFuenteInput = Partial<CreateFuenteInput & { activa: boolean }>;

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

export type ConteoPorEtiqueta = {
  etiqueta: string;
  total: number;
};

export type ReportesFiltros = {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  rol?: string;
};

export type ReportesKpis = ReportesResumen & {
  postulacionesActivas: number;
  perfilesCompletos: number;
  tasaPerfilCompleto: number;
  tasaPostulacionPorOferta: number;
  recomendacionPuntajePromedio: number;
};

export type ReporteUsuarioItem = {
  id: string;
  email: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
  perfilCompleto: boolean;
  completitudPct: number;
};

export type ReporteOfertaItem = {
  id: string;
  title: string;
  company: string;
  estado: string;
  modalidad?: string;
  fuenteNombre?: string;
  creadoEn: string;
};

export type ReporteRecomendacionItem = {
  id: string;
  perfilEmail: string;
  empleoTitulo: string;
  puntaje: number;
  creadoEn: string;
};

export type ReportePostulacionItem = {
  id: string;
  perfilEmail: string;
  empleoTitulo: string;
  estado: string;
  fechaPostulacion: string;
};

export type ListReporteResult<T> = {
  items: T[];
  total: number;
};

export type IncidenciaResumen = {
  id: string;
  titulo: string;
  estado: string;
  creadoEn: string;
};

export type EstrategicoResumen = ReportesResumen & {
  usuariosPorRol: ConteoPorEtiqueta[];
  postulacionesPorEstado: ConteoPorEtiqueta[];
  empleosPorModalidad: ConteoPorEtiqueta[];
  recomendacionPuntajePromedio: number;
  tasaPostulacionPorOferta: number;
  incidenciasAbiertas: number;
  incidenciasRecientes: IncidenciaResumen[];
  mejorasSugeridas: string[];
};
