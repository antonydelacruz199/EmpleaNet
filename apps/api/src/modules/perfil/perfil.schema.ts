import { z } from "zod";

export const perfilSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.string()),
  location: z.string().optional(),
});

export type Perfil = z.infer<typeof perfilSchema>;
