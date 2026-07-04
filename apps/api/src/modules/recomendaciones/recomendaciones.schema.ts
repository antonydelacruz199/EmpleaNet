import { z } from "zod";
import { empleoSchema } from "../empleos/empleos.schema.js";

export const recomendacionItemSchema = z.object({
  puntaje: z.number(),
  motivo: z.string(),
  empleo: empleoSchema,
});

export type RecomendacionItem = z.infer<typeof recomendacionItemSchema>;

export const listRecomendacionesResponseSchema = z.object({
  recomendaciones: z.array(recomendacionItemSchema),
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
});

export type RecomendacionesQuery = z.infer<typeof recomendacionesQuerySchema>;
