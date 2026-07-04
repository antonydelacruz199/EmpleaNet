import { z } from "zod";

export const securePasswordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128)
  .regex(/[a-z]/, "Debe incluir al menos una minúscula")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número");

export function passwordsMatch<T extends { password: string; confirmPassword: string }>(
  data: T,
  ctx: z.RefinementCtx,
): void {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    });
  }
}
