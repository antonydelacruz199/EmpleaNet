import { z } from "zod";

export const experienciaSchema = z.object({
  id: z.string(),
  empresa: z.string(),
  cargo: z.string(),
  descripcion: z.string().optional(),
  fechaInicio: z.string(),
  fechaFin: z.string().optional(),
  actual: z.boolean(),
});

export type Experiencia = z.infer<typeof experienciaSchema>;

export const carreraSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  area: z.string().optional(),
});

export const completitudSchema = z.object({
  porcentaje: z.number(),
  completo: z.boolean(),
  secciones: z.object({
    personal: z.number(),
    academico: z.number(),
    habilidades: z.number(),
    intereses: z.number(),
    experiencia: z.number(),
    cv: z.number(),
  }),
  faltantes: z.array(z.string()),
});

export type CompletitudPerfil = z.infer<typeof completitudSchema>;

export const perfilDetalleSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  telefono: z.string().optional(),
  resumen: z.string().optional(),
  location: z.string().optional(),
  rol: z.enum(["estudiante", "egresado"]),
  carrera: carreraSchema.optional(),
  cicloActual: z.number().int().min(1).max(12).optional(),
  anioEgreso: z.number().int().min(1990).max(2100).optional(),
  skills: z.array(z.string()),
  intereses: z.array(z.string()),
  experiencias: z.array(experienciaSchema),
  cv: z
    .object({
      nombre: z.string(),
      url: z.string(),
    })
    .optional(),
  completitud: completitudSchema,
});

export type PerfilDetalle = z.infer<typeof perfilDetalleSchema>;

/** Compatibilidad con motor de recomendaciones (Fase 2) */
export const perfilSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  skills: z.array(z.string()),
  location: z.string().optional(),
  carreraNombre: z.string().optional(),
  intereses: z.array(z.string()).optional(),
  aniosExperiencia: z.number().optional(),
});

export type Perfil = z.infer<typeof perfilSchema>;

export const updatePerfilBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  telefono: z.string().trim().max(30).optional(),
  resumen: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(120).optional(),
  carreraId: z.coerce.number().int().positive().optional(),
  cicloActual: z.coerce.number().int().min(1).max(12).optional(),
  anioEgreso: z.coerce.number().int().min(1990).max(2100).optional(),
});

export type UpdatePerfilBody = z.infer<typeof updatePerfilBodySchema>;

export const updateSkillsBodySchema = z.object({
  skills: z
    .array(z.string().trim().min(1).max(64))
    .min(1)
    .max(30),
});

export type UpdateSkillsBody = z.infer<typeof updateSkillsBodySchema>;

export const updateInteresesBodySchema = z.object({
  intereses: z
    .array(z.string().trim().min(1).max(80))
    .min(1)
    .max(20),
});

export type UpdateInteresesBody = z.infer<typeof updateInteresesBodySchema>;

export const createExperienciaBodySchema = z.object({
  empresa: z.string().trim().min(1).max(120),
  cargo: z.string().trim().min(1).max(120),
  descripcion: z.string().trim().max(2000).optional(),
  fechaInicio: z.string().trim().min(4).max(10),
  fechaFin: z.string().trim().max(10).optional(),
  actual: z.boolean().default(false),
});

export type CreateExperienciaBody = z.infer<typeof createExperienciaBodySchema>;

export const updateExperienciaBodySchema = createExperienciaBodySchema;

export const uploadCvBodySchema = z.object({
  filename: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._-]+\.(pdf|doc|docx)$/i, "Formato: PDF, DOC o DOCX"),
  contentBase64: z.string().min(1).max(4_000_000),
});

export type UploadCvBody = z.infer<typeof uploadCvBodySchema>;

/** @deprecated Usar perfil autenticado vía JWT (Fase 3). */
export const PERFIL_DEMO_ID = 1;

export const updatePerfilBodySchemaLegacy = z.object({
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional(),
  skills: z
    .array(z.string().trim().min(1).max(64))
    .min(1)
    .max(30),
});

export type UpdatePerfilBodyLegacy = z.infer<typeof updatePerfilBodySchemaLegacy>;
