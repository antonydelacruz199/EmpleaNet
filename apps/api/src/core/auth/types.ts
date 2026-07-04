export const ROLES = [
  "estudiante",
  "egresado",
  "administrador",
  "soporte",
  "empresa",
] as const;

export type RolUsuario = (typeof ROLES)[number];

/** Roles que pueden registrarse de forma pública */
export const ROLES_REGISTRO = ["estudiante", "egresado", "empresa"] as const;
export type RolRegistro = (typeof ROLES_REGISTRO)[number];

export type AuthUser = {
  userId: number;
  email: string;
  rol: RolUsuario;
  perfilId: number | null;
};

export type JwtPayload = AuthUser & {
  iat: number;
  exp: number;
};
