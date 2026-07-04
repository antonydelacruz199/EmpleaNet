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

function queryPage() {
  return z.preprocess((value: unknown): number => {
    if (value === undefined || value === null || value === "") {
      return 1;
    }
    const raw: unknown = Array.isArray(value) ? value[0] : value;
    const n =
      typeof raw === "string"
        ? parseInt(raw, 10)
        : typeof raw === "number"
          ? raw
          : Number.NaN;
    if (!Number.isFinite(n) || n < 1) {
      return 1;
    }
    return n;
  }, z.number().int().min(1));
}

function queryLimit() {
  return z.preprocess((value: unknown): number => {
    if (value === undefined || value === null || value === "") {
      return 20;
    }
    const raw: unknown = Array.isArray(value) ? value[0] : value;
    const n =
      typeof raw === "string"
        ? parseInt(raw, 10)
        : typeof raw === "number"
          ? raw
          : Number.NaN;
    if (!Number.isFinite(n) || n < 1) {
      return 20;
    }
    return n > 100 ? 100 : n;
  }, z.number().int().min(1).max(100));
}

const listEmpleosQueryIn = z.object({
  q: queryString(120),
  /** Alias legacy (compat web); gana `ubicacion` si ambos vienen. */
  ubicacion: queryString(120),
  location: queryString(120),
  modalidad: queryString(64),
  fuente: queryString(120),
  categoria: queryString(64),
  tipo: queryString(64),
  empresa: queryString(120),
  fechaDesde: queryString(32),
  fechaHasta: queryString(32),
  page: queryPage(),
  limit: queryLimit(),
});

export const listEmpleosQuerySchema = listEmpleosQueryIn.transform((d) => ({
  q: d.q,
  ubicacion: d.ubicacion ?? d.location,
  modalidad: d.modalidad,
  fuente: d.fuente,
  categoria: d.categoria,
  tipo: d.tipo,
  empresa: d.empresa,
  fechaDesde: d.fechaDesde,
  fechaHasta: d.fechaHasta,
  page: d.page,
  limit: d.limit,
}));

export type ListEmpleosQuery = z.infer<typeof listEmpleosQuerySchema>;

export const empleoSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  /** Modalidad de trabajo ofrecida, p. ej. remoto, presencial, hibrido. */
  modalidad: z.string().optional(),
  tags: z.array(z.string()).optional(),
  descripcion: z.string().optional(),
  urlOferta: z.string().optional(),
  salario: z.string().optional(),
  fechaPublicacion: z.string().optional(),
  fuenteNombre: z.string().optional(),
  categoria: z.string().optional(),
  tipoOportunidad: z.string().optional(),
});

export type Empleo = z.infer<typeof empleoSchema>;

export type ListEmpleosResult = {
  empleos: Empleo[];
  page: number;
  limit: number;
  total: number;
};

export const empleoIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export type EmpleoIdParams = z.infer<typeof empleoIdParamsSchema>;
