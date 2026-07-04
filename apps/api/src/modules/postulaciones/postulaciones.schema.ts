import { z } from "zod";
import type { Empleo } from "../empleos/empleos.schema.js";

export const ESTADOS_POSTULACION = ["registrada", "en_proceso", "cerrada"] as const;
export type EstadoPostulacion = (typeof ESTADOS_POSTULACION)[number];

export const crearPostulacionBodySchema = z.object({
  empleoId: z.union([z.string().regex(/^\d+$/), z.number().int().positive()]),
});

export type CrearPostulacionBody = z.infer<typeof crearPostulacionBodySchema>;

export type Postulacion = {
  id: string;
  empleoId: string;
  estado: EstadoPostulacion;
  fechaPostulacion: string;
  empleo?: Empleo;
};

export type CrearPostulacionResult = {
  postulacion: Postulacion;
  urlOferta?: string;
};

export type ListPostulacionesResult = {
  postulaciones: Postulacion[];
  total: number;
};

export type PostulacionEstadoEmpleo = {
  postulado: boolean;
  postulacion?: Postulacion;
};
