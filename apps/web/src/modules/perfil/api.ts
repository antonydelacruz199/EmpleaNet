import { httpJson } from "../../core/http/clienteHttp";
import type { Perfil, UpdatePerfilInput } from "./tipos";

export async function fetchPerfil(): Promise<Perfil> {
  return httpJson<Perfil>("/perfil/me");
}

export async function updatePerfil(data: UpdatePerfilInput): Promise<Perfil> {
  return httpJson<Perfil>("/perfil/me", {
    method: "PUT",
    body: data,
  });
}
