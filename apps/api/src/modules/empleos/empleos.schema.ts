import { z } from "zod";

function queryString(max: number) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (Array.isArray(value)) {
      return typeof value[0] === "string" ? value[0] : undefined;
    }
    return value;
  }, z.string().trim().max(max).optional());
}

export const empleoSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Empleo = z.infer<typeof empleoSchema>;

export const listEmpleosQuerySchema = z.object({
  q: queryString(120),
  location: queryString(120),
});

export type ListEmpleosQuery = z.infer<typeof listEmpleosQuerySchema>;

export const empleoIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export type EmpleoIdParams = z.infer<typeof empleoIdParamsSchema>;
