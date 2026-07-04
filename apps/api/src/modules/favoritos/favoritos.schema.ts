import { z } from "zod";
import type { Empleo } from "../empleos/empleos.schema.js";

export const guardarFavoritoBodySchema = z.object({
  empleoId: z.union([z.string().regex(/^\d+$/), z.number().int().positive()]),
});

export type GuardarFavoritoBody = z.infer<typeof guardarFavoritoBodySchema>;

export type Favorito = {
  id: string;
  empleoId: string;
  creadoEn: string;
  empleo: Empleo;
};

export type ListFavoritosResult = {
  favoritos: Favorito[];
  total: number;
};

export type FavoritoEstadoEmpleo = {
  esFavorito: boolean;
};
