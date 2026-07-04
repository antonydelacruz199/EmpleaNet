import { z } from "zod";
import { ROLES, ROLES_REGISTRO } from "../../core/auth/types.js";
import {
  passwordsMatch,
  securePasswordSchema,
} from "./auth-password.schema.js";

export const loginBodySchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(6).max(128),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const registerBodySchema = z
  .object({
    email: z.string().trim().email().max(180),
    password: securePasswordSchema,
    confirmPassword: z.string(),
    name: z.string().trim().min(2).max(120),
    rol: z.enum(ROLES_REGISTRO),
  })
  .superRefine(passwordsMatch);

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email().max(180),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z
  .object({
    token: z.string().trim().min(32).max(128),
    password: securePasswordSchema,
    confirmPassword: z.string(),
  })
  .superRefine(passwordsMatch);

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const usuarioSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  rol: z.enum(ROLES),
  name: z.string(),
  perfilId: z.string().nullable(),
  perfilCompleto: z.boolean(),
});

export type UsuarioPublico = z.infer<typeof usuarioSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: usuarioSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const messageResponseSchema = z.object({
  message: z.string(),
  devResetToken: z.string().optional(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;

export const DEMO_PASSWORD = "Continental2026";

export const AUTH_LOCK_MAX_ATTEMPTS = 5;
export const AUTH_LOCK_MINUTES = 15;
export const RESET_TOKEN_HOURS = 1;

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
  {
    email: "empresa@continental.edu.pe",
    rol: "empresa",
    name: "Empresa Demo Continental",
    skills: "reclutamiento,rrhh,tecnologia",
    location: "Lima",
  },
];
