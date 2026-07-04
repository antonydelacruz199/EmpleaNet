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

export type EstrategicoResumen = ReportesResumen & {
  usuariosPorRol: ConteoPorEtiqueta[];
  postulacionesPorEstado: ConteoPorEtiqueta[];
  empleosPorModalidad: ConteoPorEtiqueta[];
  recomendacionPuntajePromedio: number;
  tasaPostulacionPorOferta: number;
  incidenciasAbiertas: number;
};
