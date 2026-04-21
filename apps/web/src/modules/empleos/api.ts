import { httpJson } from "../../core/http/clienteHttp";
import type { Empleo, EmpleoDetalle } from "./tipos";

export async function fetchEmpleos(filters: { q?: string; location?: string }): Promise<Empleo[]> {
  return httpJson<Empleo[]>("/empleos", {
    searchParams: {
      q: filters.q,
      location: filters.location,
    },
  });
}

export async function fetchEmpleoById(id: string): Promise<EmpleoDetalle> {
  return httpJson<EmpleoDetalle>(`/empleos/${encodeURIComponent(id)}`);
}
