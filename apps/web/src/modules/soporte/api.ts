import { httpJson } from "../../core/http/clienteHttp";
import type {
  Incidencia,
  MotorConfig,
  MotorConfigInput,
  RecalcularMotorResult,
  RegistroAuditoria,
} from "./tipos";

export async function fetchMotorConfig(): Promise<MotorConfig> {
  return httpJson<MotorConfig>("/soporte/motor/config");
}

export async function updateMotorConfig(data: MotorConfigInput): Promise<MotorConfig> {
  return httpJson<MotorConfig>("/soporte/motor/config", {
    method: "PUT",
    body: data,
  });
}

export async function recalcularMotor(): Promise<RecalcularMotorResult> {
  return httpJson<RecalcularMotorResult>("/soporte/motor/recalcular", {
    method: "POST",
  });
}

export async function fetchIncidencias(): Promise<{ incidencias: Incidencia[] }> {
  return httpJson<{ incidencias: Incidencia[] }>("/soporte/incidencias");
}

export async function crearIncidencia(data: {
  titulo: string;
  descripcion?: string;
}): Promise<Incidencia> {
  return httpJson<Incidencia>("/soporte/incidencias", {
    method: "POST",
    body: data,
  });
}

export async function actualizarIncidenciaEstado(
  id: string,
  estado: Incidencia["estado"],
): Promise<Incidencia> {
  return httpJson<Incidencia>(`/soporte/incidencias/${id}/estado`, {
    method: "PATCH",
    body: { estado },
  });
}

export async function fetchAuditoria(limit = 30): Promise<{
  registros: RegistroAuditoria[];
}> {
  return httpJson<{ registros: RegistroAuditoria[] }>("/soporte/auditoria", {
    searchParams: { limit: String(limit) },
  });
}
