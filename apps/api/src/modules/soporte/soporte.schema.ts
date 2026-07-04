import { z } from "zod";
import { motorConfigBodySchema } from "./motor-config.repository.js";

export { motorConfigBodySchema };
export type { MotorConfig, MotorConfigBody } from "./motor-config.repository.js";

export const crearIncidenciaBodySchema = z.object({
  titulo: z.string().trim().min(3).max(200),
  descripcion: z.string().trim().max(2000).optional(),
});

export type CrearIncidenciaBody = z.infer<typeof crearIncidenciaBodySchema>;

export const actualizarIncidenciaEstadoSchema = z.object({
  estado: z.enum(["abierta", "en_proceso", "cerrada"]),
});

export type ActualizarIncidenciaEstadoBody = z.infer<
  typeof actualizarIncidenciaEstadoSchema
>;

export type Incidencia = {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: "abierta" | "en_proceso" | "cerrada";
  creadoEn: string;
  reportadoPor?: string;
};

export type RecalcularMotorResult = {
  perfilesRecalculados: number;
};
