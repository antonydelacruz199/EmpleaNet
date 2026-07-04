import { httpJson } from "../http/clienteHttp";
import { clearAuthToken, setAuthToken } from "./tokenStorage";

export type RolUsuario =
  | "estudiante"
  | "egresado"
  | "administrador"
  | "soporte"
  | "empresa";

export type RolRegistro = "estudiante" | "egresado" | "empresa";

export type UsuarioSesion = {
  id: string;
  email: string;
  rol: RolUsuario;
  name: string;
  perfilId: string | null;
  perfilCompleto: boolean;
};

export type LoginResponse = {
  token: string;
  user: UsuarioSesion;
};

export type MessageResponse = {
  message: string;
  devResetToken?: string;
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

export async function registerApi(input: {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  rol: RolRegistro;
}): Promise<LoginResponse> {
  const result = await httpJson<LoginResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
  setAuthToken(result.token);
  return result;
}

export async function forgotPasswordApi(
  email: string,
): Promise<MessageResponse> {
  return httpJson<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPasswordApi(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<MessageResponse> {
  return httpJson<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: input,
  });
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

export function isEmpresaRole(rol: RolUsuario): boolean {
  return rol === "empresa";
}
