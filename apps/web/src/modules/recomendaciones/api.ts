import { httpJson } from "../../core/http/clienteHttp";
import type { ListadoRecomendaciones } from "./tipos";

export async function fetchRecomendaciones(
  limit = 20,
): Promise<ListadoRecomendaciones> {
  return httpJson<ListadoRecomendaciones>("/recomendaciones", {
    searchParams: { limit: String(limit) },
  });
}
