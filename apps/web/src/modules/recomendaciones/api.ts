import { httpJson } from "../../core/http/clienteHttp";
import type {
  CoincidenciaDetalle,
  ListadoRecomendaciones,
  NivelCoincidencia,
  PreferenciasLaborales,
} from "./tipos";

export async function fetchRecomendaciones(
  limit = 20,
  nivel?: NivelCoincidencia,
): Promise<ListadoRecomendaciones> {
  return httpJson<ListadoRecomendaciones>("/recomendaciones", {
    searchParams: {
      limit: String(limit),
      ...(nivel ? { nivel } : {}),
    },
  });
}

export async function recalcularRecomendaciones(): Promise<{
  recalculadas: number;
  mensaje: string;
}> {
  return httpJson("/recomendaciones/recalcular", { method: "POST" });
}

export async function fetchCoincidencia(empleoId: string): Promise<CoincidenciaDetalle> {
  return httpJson<CoincidenciaDetalle>(
    `/recomendaciones/coincidencia/${encodeURIComponent(empleoId)}`,
  );
}

export async function fetchPreferenciasLaborales(): Promise<PreferenciasLaborales> {
  return httpJson<PreferenciasLaborales>("/recomendaciones/preferencias");
}

export async function updatePreferenciasLaborales(
  data: PreferenciasLaborales,
): Promise<PreferenciasLaborales> {
  return httpJson<PreferenciasLaborales>("/recomendaciones/preferencias", {
    method: "PUT",
    body: data,
  });
}
