import { z } from "zod";

export const recomendacionesQuerySchema = z.object({
  skills: z.preprocess((value) => {
    if (Array.isArray(value)) {
      return typeof value[0] === "string" ? value[0] : value;
    }
    return value;
  }, z.string().trim().min(1).max(500)),
});

export type RecomendacionesQuery = z.infer<typeof recomendacionesQuerySchema>;
