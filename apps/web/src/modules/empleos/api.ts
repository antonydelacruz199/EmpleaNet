import { httpJson } from "../../core/http/clienteHttp";
import type { EmpleoDetalle, ListadoEmpleos } from "./tipos";

export type FiltrosListadoEmpleos = {
  q?: string;
  ubicacion?: string;
  location?: string;
  modalidad?: string;
  fuente?: string;
  page?: number;
  limit?: number;
};

function paramNumero(n: number | undefined) {
  return n === undefined ? undefined : String(n);
}

export async function fetchEmpleos(
  params: FiltrosListadoEmpleos = {},
): Promise<ListadoEmpleos> {
  return httpJson<ListadoEmpleos>("/empleos", {
    searchParams: {
      q: params.q,
      ubicacion: params.ubicacion,
      location: params.location,
      modalidad: params.modalidad,
      fuente: params.fuente,
      page: paramNumero(params.page),
      limit: paramNumero(params.limit),
    },
  });
}

export async function fetchEmpleoById(id: string): Promise<EmpleoDetalle> {
  return httpJson<EmpleoDetalle>(`/empleos/${encodeURIComponent(id)}`);
}
