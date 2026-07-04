import { httpJson } from "../../core/http/clienteHttp";
import type {
  Favorito,
  FavoritoEstadoEmpleo,
  ListFavoritosResult,
} from "./tipos";

export async function fetchFavoritos(): Promise<ListFavoritosResult> {
  return httpJson<ListFavoritosResult>("/favoritos");
}

export async function fetchFavoritoEstado(
  empleoId: string,
): Promise<FavoritoEstadoEmpleo> {
  return httpJson<FavoritoEstadoEmpleo>(`/favoritos/empleo/${empleoId}`);
}

export async function guardarFavorito(empleoId: string): Promise<Favorito> {
  return httpJson<Favorito>("/favoritos", {
    method: "POST",
    body: { empleoId },
  });
}

export async function quitarFavorito(empleoId: string): Promise<void> {
  return httpJson<void>(`/favoritos/${empleoId}`, { method: "DELETE" });
}
