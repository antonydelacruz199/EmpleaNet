import { z } from "zod";

export const perfilSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  skills: z.array(z.string()),
  location: z.string().optional(),
});

export type Perfil = z.infer<typeof perfilSchema>;

export const updatePerfilBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional(),
  skills: z
    .array(z.string().trim().min(1).max(64))
    .min(1)
    .max(30),
});

export type UpdatePerfilBody = z.infer<typeof updatePerfilBodySchema>;

/** Perfil activo en fases sin autenticación (Fase 2). */
export const PERFIL_DEMO_ID = 1;
