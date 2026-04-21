import { httpJson } from "../../core/http/clienteHttp";
import type { Perfil } from "./tipos";

export async function fetchPerfil(): Promise<Perfil> {
  return httpJson<Perfil>("/perfil/me");
}
