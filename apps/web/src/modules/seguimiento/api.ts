import { httpJson } from "../../core/http/clienteHttp";
import type { Empleo } from "../empleos/tipos";

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

export async function fetchSeguimientoResumen(): Promise<SeguimientoResumen> {
  return httpJson<SeguimientoResumen>("/seguimiento/resumen");
}

export async function fetchVistas(): Promise<ListVistasResult> {
  return httpJson<ListVistasResult>("/seguimiento/vistas");
}

export async function registrarVista(empleoId: string): Promise<{ vista: OportunidadVista }> {
  return httpJson<{ vista: OportunidadVista }>("/seguimiento/vistas", {
    method: "POST",
    body: { empleoId },
  });
}
