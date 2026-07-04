import { z } from "zod";
import { empleoSchema } from "../empleos/empleos.schema.js";

export const nivelesCoincidencia = [
  "alta",
  "media",
  "baja",
  "no_recomendable",
] as const;

export type NivelCoincidencia = (typeof nivelesCoincidencia)[number];

export const desgloseSchema = z.object({
  habilidades: z.number(),
  carrera: z.number(),
  intereses: z.number(),
  modalidad: z.number(),
  ubicacion: z.number(),
  experiencia: z.number(),
});

export type DesglosePuntaje = z.infer<typeof desgloseSchema>;

export const recomendacionItemSchema = z.object({
  puntaje: z.number(),
  nivel: z.enum(nivelesCoincidencia),
  motivo: z.string(),
  razones: z.array(z.string()),
  desglose: desgloseSchema,
  yaPostulado: z.boolean().optional(),
  empleo: empleoSchema,
});

export type RecomendacionItem = z.infer<typeof recomendacionItemSchema>;

export const listRecomendacionesResponseSchema = z.object({
  recomendaciones: z.array(recomendacionItemSchema),
  total: z.number().optional(),
  perfilIncompleto: z.boolean().optional(),
});

export type ListRecomendacionesResponse = z.infer<
  typeof listRecomendacionesResponseSchema
>;

export const recomendacionesQuerySchema = z.object({
  limit: z.preprocess((value: unknown): number => {
    if (value === undefined || value === null || value === "") return 20;
    const raw = Array.isArray(value) ? value[0] : value;
    const n =
      typeof raw === "string"
        ? parseInt(raw, 10)
        : typeof raw === "number"
          ? raw
          : Number.NaN;
    if (!Number.isFinite(n) || n < 1) return 20;
    return n > 50 ? 50 : n;
  }, z.number().int().min(1).max(50)),
  nivel: z.enum(nivelesCoincidencia).optional(),
  incluirNoRecomendables: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .optional(),
});

export type RecomendacionesQuery = z.infer<typeof recomendacionesQuerySchema>;

export const preferenciasBodySchema = z.object({
  carrera: z.string().trim().max(120).optional(),
  intereses: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
  anosExperiencia: z.coerce.number().int().min(0).max(50).optional(),
  modalidadPreferida: z.enum(["remoto", "presencial", "hibrido"]).optional(),
  ubicacionPreferida: z.string().trim().max(120).optional(),
  categoriasInteres: z
    .array(
      z.enum([
        "tecnologia",
        "negocios",
        "diseno",
        "ingenieria",
        "marketing",
        "salud",
        "otros",
      ]),
    )
    .max(10)
    .optional(),
});

export type PreferenciasBody = z.infer<typeof preferenciasBodySchema>;

export const preferenciasResponseSchema = preferenciasBodySchema.extend({
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export type PreferenciasResponse = z.infer<typeof preferenciasResponseSchema>;

export const coincidenciaParamsSchema = z.object({
  empleoId: z.string().trim().min(1),
});

export type CoincidenciaParams = z.infer<typeof coincidenciaParamsSchema>;

export const recalcularResponseSchema = z.object({
  recalculadas: z.number(),
  mensaje: z.string(),
});

export type RecalcularResponse = z.infer<typeof recalcularResponseSchema>;
