import { getAuthToken } from "../../core/auth/tokenStorage";
import { httpJson } from "../../core/http/clienteHttp";
import type {
  CreateEmpleoAdminInput,
  EmpleoAdmin,
  EstrategicoResumen,
  ListEmpleosAdminResult,
  ReportesResumen,
  UpdateEmpleoAdminInput,
} from "./tipos";

export async function fetchAdminEmpleos(): Promise<ListEmpleosAdminResult> {
  return httpJson<ListEmpleosAdminResult>("/admin/empleos");
}

export async function createAdminEmpleo(
  data: CreateEmpleoAdminInput,
): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>("/admin/empleos", {
    method: "POST",
    body: data,
  });
}

export async function updateAdminEmpleo(
  id: string,
  data: UpdateEmpleoAdminInput,
): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function setAdminEmpleoActivo(
  id: string,
  activo: boolean,
): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}/activo`, {
    method: "PATCH",
    body: { activo },
  });
}

export async function fetchReportesResumen(): Promise<ReportesResumen> {
  return httpJson<ReportesResumen>("/admin/reportes/resumen");
}

export async function fetchEstrategicoResumen(): Promise<EstrategicoResumen> {
  return httpJson<EstrategicoResumen>("/admin/estrategico/resumen");
}

export async function downloadReportesCsv(): Promise<void> {
  const token = getAuthToken();
  const response = await fetch("/api/admin/reportes/export.csv", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error("No se pudo exportar el reporte");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "reportes-continental-oportunidades.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
