import { getAuthToken } from "../../core/auth/tokenStorage";
import { httpJson } from "../../core/http/clienteHttp";
import type {
  ClasificarOfertaInput,
  CreateEmpleoAdminInput,
  CreateEmpresaInput,
  CreateFuenteInput,
  EmpleoAdmin,
  EmpresaAdmin,
  EstrategicoResumen,
  FuenteAdmin,
  ListEmpleosAdminResult,
  ListOfertasFiltros,
  OfertasResumenAdmin,
  ReportesResumen,
  UpdateEmpleoAdminInput,
  UpdateEmpresaInput,
  UpdateFuenteInput,
} from "./tipos";

function queryString(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function fetchAdminEmpleosResumen(): Promise<OfertasResumenAdmin> {
  return httpJson<OfertasResumenAdmin>("/admin/empleos/resumen");
}

export async function fetchAdminEmpleos(
  filtros: ListOfertasFiltros = {},
): Promise<ListEmpleosAdminResult> {
  return httpJson<ListEmpleosAdminResult>(
    `/admin/empleos${queryString({
      estado: filtros.estado,
      modalidad: filtros.modalidad,
      categoria: filtros.categoria,
      tipo: filtros.tipo,
      fuente: filtros.fuente,
      q: filtros.q,
    })}`,
  );
}

export async function fetchAdminEmpleo(id: string): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}`);
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

export async function validarAdminEmpleo(id: string): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}/validar`, { method: "POST" });
}

export async function clasificarAdminEmpleo(
  id: string,
  data: ClasificarOfertaInput,
): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}/clasificar`, {
    method: "POST",
    body: data,
  });
}

export async function publicarAdminEmpleo(id: string): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}/publicar`, { method: "POST" });
}

export async function rechazarAdminEmpleo(
  id: string,
  motivo: string,
): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}/rechazar`, {
    method: "POST",
    body: { motivo },
  });
}

export async function cerrarAdminEmpleo(id: string): Promise<EmpleoAdmin> {
  return httpJson<EmpleoAdmin>(`/admin/empleos/${id}/cerrar`, { method: "POST" });
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

export async function fetchAdminEmpresas(): Promise<EmpresaAdmin[]> {
  return httpJson<EmpresaAdmin[]>("/admin/empresas");
}

export async function createAdminEmpresa(
  data: CreateEmpresaInput,
): Promise<EmpresaAdmin> {
  return httpJson<EmpresaAdmin>("/admin/empresas", { method: "POST", body: data });
}

export async function updateAdminEmpresa(
  id: string,
  data: UpdateEmpresaInput,
): Promise<EmpresaAdmin> {
  return httpJson<EmpresaAdmin>(`/admin/empresas/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function fetchAdminFuentes(): Promise<FuenteAdmin[]> {
  return httpJson<FuenteAdmin[]>("/admin/fuentes");
}

export async function createAdminFuente(data: CreateFuenteInput): Promise<FuenteAdmin> {
  return httpJson<FuenteAdmin>("/admin/fuentes", { method: "POST", body: data });
}

export async function updateAdminFuente(
  id: string,
  data: UpdateFuenteInput,
): Promise<FuenteAdmin> {
  return httpJson<FuenteAdmin>(`/admin/fuentes/${id}`, {
    method: "PUT",
    body: data,
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
