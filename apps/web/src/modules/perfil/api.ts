import { httpJson } from "../../core/http/clienteHttp";
import type { Carrera, CompletitudPerfil, PerfilDetalle, UsuarioPerfilResumen } from "./tipos";

export async function fetchPerfil(): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>("/perfil/me");
}

export async function fetchCompletitud(): Promise<CompletitudPerfil> {
  return httpJson<CompletitudPerfil>("/perfil/me/completitud");
}

export async function fetchCarreras(): Promise<Carrera[]> {
  return httpJson<Carrera[]>("/perfil/carreras");
}

export async function updatePerfil(data: {
  name: string;
  telefono?: string;
  resumen?: string;
  location?: string;
  carreraId?: number;
  cicloActual?: number;
  anioEgreso?: number;
}): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>("/perfil/me", { method: "PUT", body: data });
}

export async function updateHabilidades(skills: string[]): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>("/perfil/me/habilidades", {
    method: "PUT",
    body: { skills },
  });
}

export async function updateIntereses(intereses: string[]): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>("/perfil/me/intereses", {
    method: "PUT",
    body: { intereses },
  });
}

export async function addExperiencia(data: {
  empresa: string;
  cargo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  actual: boolean;
}): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>("/perfil/me/experiencia", {
    method: "POST",
    body: data,
  });
}

export async function deleteExperiencia(id: string): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>(`/perfil/me/experiencia/${id}`, {
    method: "DELETE",
  });
}

export async function uploadCv(file: File): Promise<PerfilDetalle> {
  const contentBase64 = await fileToBase64(file);
  return httpJson<PerfilDetalle>("/perfil/me/cv", {
    method: "POST",
    body: { filename: file.name, contentBase64 },
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(",") ? result.split(",")[1]! : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function downloadCvBlob(): Promise<Blob> {
  const token = (await import("../../core/auth/tokenStorage")).getAuthToken();
  const res = await fetch("/api/perfil/me/cv", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("No se pudo descargar el CV");
  return res.blob();
}

export async function deleteCv(): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>("/perfil/me/cv", { method: "DELETE" });
}

export function cvDownloadUrl(): string {
  return "/api/perfil/me/cv";
}

export async function fetchUsuariosAdmin(): Promise<UsuarioPerfilResumen[]> {
  return httpJson<UsuarioPerfilResumen[]>("/admin/usuarios");
}

export async function fetchUsuarioPerfilAdmin(
  usuarioId: string,
): Promise<PerfilDetalle> {
  return httpJson<PerfilDetalle>(`/admin/usuarios/${usuarioId}/perfil`);
}
