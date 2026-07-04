import { httpJson } from "../http/clienteHttp";
import { clearAuthToken, setAuthToken } from "./tokenStorage";

export type RolUsuario =
  | "estudiante"
  | "egresado"
  | "administrador"
  | "soporte";

export type UsuarioSesion = {
  id: string;
  email: string;
  rol: RolUsuario;
  name: string;
  perfilId: string | null;
};

export type LoginResponse = {
  token: string;
  user: UsuarioSesion;
};

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const result = await httpJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setAuthToken(result.token);
  return result;
}

export async function fetchSessionUser(): Promise<UsuarioSesion> {
  return httpJson<UsuarioSesion>("/auth/me");
}

export async function logoutApi(): Promise<void> {
  try {
    await httpJson<void>("/auth/logout", { method: "POST" });
  } finally {
    clearAuthToken();
  }
}

export function isStudentRole(rol: RolUsuario): boolean {
  return rol === "estudiante" || rol === "egresado";
}

export function isAdminRole(rol: RolUsuario): boolean {
  return rol === "administrador";
}

export function isSoporteRole(rol: RolUsuario): boolean {
  return rol === "soporte";
}
