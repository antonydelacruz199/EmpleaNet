import type { PostulacionEmpleo } from "../postulaciones/tipos";

export type Favorito = {
  id: string;
  empleoId: string;
  creadoEn: string;
  empleo: PostulacionEmpleo;
};

export type FavoritoEstadoEmpleo = {
  esFavorito: boolean;
};

export type ListFavoritosResult = {
  favoritos: Favorito[];
  total: number;
};
