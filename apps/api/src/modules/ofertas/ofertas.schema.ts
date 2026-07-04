import { z } from "zod";

export const MODALIDADES = ["remoto", "presencial", "hibrido"] as const;

export const CATEGORIAS = [
  "tecnologia",
  "negocios",
  "diseno",
  "ingenieria",
  "marketing",
  "salud",
  "otros",
] as const;

export const TIPOS_OPORTUNIDAD = [
  "empleo",
  "practica",
  "convenio",
  "freelance",
] as const;

export const ESTADOS_OFERTA = [
  "borrador",
  "pendiente_validacion",
  "validada",
  "publicada",
  "rechazada",
  "cerrada",
  "archivada",
] as const;

export type EstadoOferta = (typeof ESTADOS_OFERTA)[number];

export const createOfertaBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  company: z.string().trim().min(2).max(120),
  fuenteId: z.coerce.number().int().positive(),
  empresaId: z.coerce.number().int().positive().optional(),
  location: z.string().trim().max(120).optional(),
  modalidad: z.enum(MODALIDADES).optional(),
  categoria: z.enum(CATEGORIAS).optional(),
  tipoOportunidad: z.enum(TIPOS_OPORTUNIDAD).optional(),
  descripcion: z.string().trim().max(8000).optional(),
  urlOferta: z.string().trim().url().max(500).optional(),
  salario: z.string().trim().max(120).optional(),
  fechaPublicacion: z.string().trim().max(32).optional(),
  fechaCierre: z.string().trim().max(32).optional(),
  habilidadesRequeridas: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
});

export type CreateOfertaBody = z.infer<typeof createOfertaBodySchema>;

export const updateOfertaBodySchema = createOfertaBodySchema.partial();

export type UpdateOfertaBody = z.infer<typeof updateOfertaBodySchema>;

export const clasificarOfertaBodySchema = z.object({
  modalidad: z.enum(MODALIDADES),
  categoria: z.enum(CATEGORIAS),
  tipoOportunidad: z.enum(TIPOS_OPORTUNIDAD),
  habilidadesRequeridas: z.array(z.string().trim().min(1).max(64)).min(1).max(20),
});

export type ClasificarOfertaBody = z.infer<typeof clasificarOfertaBodySchema>;

export const rechazarOfertaBodySchema = z.object({
  motivo: z.string().trim().min(5).max(500),
});

export type RechazarOfertaBody = z.infer<typeof rechazarOfertaBodySchema>;

export const listOfertasAdminQuerySchema = z.object({
  estado: z.enum(ESTADOS_OFERTA).optional(),
  modalidad: z.enum(MODALIDADES).optional(),
  categoria: z.enum(CATEGORIAS).optional(),
  tipo: z.enum(TIPOS_OPORTUNIDAD).optional(),
  fuente: z.string().trim().max(80).optional(),
  q: z.string().trim().max(120).optional(),
});

export type ListOfertasAdminQuery = z.infer<typeof listOfertasAdminQuerySchema>;

export type OfertaAdmin = {
  id: string;
  title: string;
  company: string;
  location?: string;
  modalidad?: string;
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
  habilidadesRequeridas: string[];
  activo: boolean;
  vencida: boolean;
  creadoEn?: string;
  validadoEn?: string;
  publicadoEn?: string;
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

export const createEmpresaBodySchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  sector: z.string().trim().max(80).optional(),
  contactoEmail: z.string().trim().email().max(180).optional(),
});

export type CreateEmpresaBody = z.infer<typeof createEmpresaBodySchema>;

export const updateEmpresaBodySchema = createEmpresaBodySchema.partial().extend({
  activa: z.boolean().optional(),
});

export type UpdateEmpresaBody = z.infer<typeof updateEmpresaBodySchema>;

export type Empresa = {
  id: string;
  nombre: string;
  sector?: string;
  contactoEmail?: string;
  activa: boolean;
};

export const createFuenteBodySchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  tipo: z.enum(["manual", "api", "institucional", "externa"]),
  url: z.string().trim().url().max(500).optional(),
});

export type CreateFuenteBody = z.infer<typeof createFuenteBodySchema>;

export const updateFuenteBodySchema = createFuenteBodySchema.partial().extend({
  activa: z.boolean().optional(),
});

export type UpdateFuenteBody = z.infer<typeof updateFuenteBodySchema>;

export type FuenteAdmin = {
  id: string;
  nombre: string;
  tipo: string;
  url?: string;
  activa: boolean;
};
