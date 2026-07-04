import { httpJson } from "../../core/http/clienteHttp";

export type Fuente = {
  id: string;
  name: string;
  enabled: boolean;
  type: string;
};

export async function fetchFuentes(): Promise<Fuente[]> {
  return httpJson<Fuente[]>("/fuentes");
}
