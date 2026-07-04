import type { EstadoPostulacion } from "./tipos";

export function etiquetaEstadoPostulacion(estado: EstadoPostulacion): string {
  const map: Record<EstadoPostulacion, string> = {
    registrada: "Registrada",
    en_proceso: "En proceso",
    cerrada: "Cerrada",
  };
  return map[estado] ?? estado;
}

export function claseEstadoPostulacion(estado: EstadoPostulacion): string {
  const map: Record<EstadoPostulacion, string> = {
    registrada: "estado-badge estado-badge--registrada",
    en_proceso: "estado-badge estado-badge--proceso",
    cerrada: "estado-badge estado-badge--cerrada",
  };
  return map[estado] ?? "estado-badge";
}

export function formatearFecha(fecha: string): string {
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return fecha;
  return parsed.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
