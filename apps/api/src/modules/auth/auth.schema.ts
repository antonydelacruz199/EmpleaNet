import { z } from "zod";
import { ROLES } from "../../core/auth/types.js";

export const loginBodySchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(6).max(128),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const usuarioSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  rol: z.enum(ROLES),
  name: z.string(),
  perfilId: z.string().nullable(),
});

export type UsuarioPublico = z.infer<typeof usuarioSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: usuarioSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const DEMO_PASSWORD = "Continental2026";

export const DEMO_USERS: {
  email: string;
  rol: (typeof ROLES)[number];
  name: string;
  skills: string;
  location: string;
}[] = [
  {
    email: "estudiante@continental.edu.pe",
    rol: "estudiante",
    name: "Estudiante Continental",
    skills: "typescript,react,nodejs",
    location: "Remoto",
  },
  {
    email: "egresado@continental.edu.pe",
    rol: "egresado",
    name: "Egresado Continental",
    skills: "javascript,sql,comunicacion",
    location: "Lima",
  },
  {
    email: "admin@continental.edu.pe",
    rol: "administrador",
    name: "Administrador Institucional",
    skills: "gestion,reportes,analisis",
    location: "Lima",
  },
  {
    email: "soporte@continental.edu.pe",
    rol: "soporte",
    name: "Soporte Técnico UC",
    skills: "sistemas,mantenimiento,soporte",
    location: "Lima",
  },
];
