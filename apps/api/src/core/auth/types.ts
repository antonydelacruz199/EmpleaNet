export const ROLES = [
  "estudiante",
  "egresado",
  "administrador",
  "soporte",
] as const;

export type RolUsuario = (typeof ROLES)[number];

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
