import { z } from "zod";

export const MODALIDADES = ["remoto", "presencial", "hibrido"] as const;

export const createEmpleoAdminBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  company: z.string().trim().min(2).max(120),
  location: z.string().trim().max(120).optional(),
  modalidad: z.enum(MODALIDADES).optional(),
  descripcion: z.string().trim().max(8000).optional(),
  urlOferta: z.string().trim().url().max(500).optional(),
  salario: z.string().trim().max(120).optional(),
  fechaPublicacion: z.string().trim().max(32).optional(),
});

export type CreateEmpleoAdminBody = z.infer<typeof createEmpleoAdminBodySchema>;

export const updateEmpleoAdminBodySchema = createEmpleoAdminBodySchema.partial();

export type UpdateEmpleoAdminBody = z.infer<typeof updateEmpleoAdminBodySchema>;

export const updateEmpleoActivoBodySchema = z.object({
  activo: z.boolean(),
});

export type UpdateEmpleoActivoBody = z.infer<typeof updateEmpleoActivoBodySchema>;

export type EmpleoAdmin = {
  id: string;
  title: string;
  company: string;
  location?: string;
  modalidad?: string;
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

export const reportesFiltrosQuerySchema = z.object({
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estado: z.string().trim().min(1).max(40).optional(),
  rol: z.enum(["estudiante", "egresado", "empresa", "administrador", "soporte"]).optional(),
});

export type ReportesFiltros = z.infer<typeof reportesFiltrosQuerySchema>;

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
