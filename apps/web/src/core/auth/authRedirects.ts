import type { RolUsuario, UsuarioSesion } from "./authApi";

export function needsPerfilCompleto(user: UsuarioSesion): boolean {
  if (user.perfilCompleto) return false;
  return (
    user.rol === "estudiante" ||
    user.rol === "egresado" ||
    user.rol === "empresa"
  );
}

export function resolvePostAuthPath(
  user: UsuarioSesion,
  from?: string,
): string {
  if (needsPerfilCompleto(user)) return "/primer-acceso";
  if (from && from !== "/login" && !from.startsWith("/registro")) {
    return from;
  }
  if (user.rol === "administrador") return "/admin/reportes";
  if (user.rol === "soporte") return "/soporte/motor";
  return "/";
}

export function isEmpresaRole(rol: RolUsuario): boolean {
  return rol === "empresa";
}
