import { z } from "zod";
import type { Empleo } from "../empleos/empleos.schema.js";

export const registrarVistaBodySchema = z.object({
  empleoId: z.union([z.string().regex(/^\d+$/), z.number().int().positive()]),
});

export type RegistrarVistaBody = z.infer<typeof registrarVistaBodySchema>;

export type OportunidadVista = {
  id: string;
  empleoId: string;
  vistoEn: string;
  empleo: Empleo;
};

export type ListVistasResult = {
  vistas: OportunidadVista[];
  total: number;
};

export type SeguimientoResumen = {
  postulaciones: number;
  postulacionesActivas: number;
  favoritos: number;
  vistas: number;
};
