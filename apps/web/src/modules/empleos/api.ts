import { httpJson } from "../../core/http/clienteHttp";
import type { Empleo } from "./tipos";

export async function fetchEmpleos(filters: { q?: string; location?: string }): Promise<Empleo[]> {
  return httpJson<Empleo[]>("/empleos", {
    searchParams: {
      q: filters.q,
      location: filters.location,
    },
  });
}
