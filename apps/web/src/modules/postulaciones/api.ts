import { httpJson } from "../../core/http/clienteHttp";
import type {
  CrearPostulacionResult,
  ListPostulacionesResult,
  PostulacionEstadoEmpleo,
  PostulacionesResumen,
} from "./tipos";

export async function fetchPostulaciones(): Promise<ListPostulacionesResult> {
  return httpJson<ListPostulacionesResult>("/postulaciones");
}

export async function fetchPostulacionesResumen(): Promise<PostulacionesResumen> {
  return httpJson<PostulacionesResumen>("/postulaciones/resumen");
}

export async function fetchPostulacionEstado(
  empleoId: string,
): Promise<PostulacionEstadoEmpleo> {
  return httpJson<PostulacionEstadoEmpleo>(`/postulaciones/empleo/${empleoId}`);
}

export async function crearPostulacion(
  empleoId: string,
): Promise<CrearPostulacionResult> {
  return httpJson<CrearPostulacionResult>("/postulaciones", {
    method: "POST",
    body: { empleoId },
  });
}
