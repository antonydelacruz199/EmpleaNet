import { httpJson } from "../../core/http/clienteHttp";
import type { Empleo } from "../empleos/tipos";

export async function fetchRecomendaciones(filters: { skills: string }): Promise<Empleo[]> {
  return httpJson<Empleo[]>("/recomendaciones", {
    searchParams: { skills: filters.skills },
  });
}
