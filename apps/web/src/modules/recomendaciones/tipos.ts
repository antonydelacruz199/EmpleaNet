import type { Empleo } from "../empleos/tipos";

export type Recomendacion = {
  puntaje: number;
  motivo: string;
  empleo: Empleo;
};

export type ListadoRecomendaciones = {
  recomendaciones: Recomendacion[];
};
