import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).default("sqlite://database/empleanet.db"),
});

export const env = envSchema.parse(process.env);
