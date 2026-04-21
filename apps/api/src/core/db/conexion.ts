import { env } from "../../config/env.js";

type ConexionDb = {
  url: string;
};

let conexion: ConexionDb | null = null;

export function getConexion(): ConexionDb {
  if (conexion === null) {
    conexion = { url: env.DATABASE_URL };
  }
  return conexion;
}
