import { z } from "zod";

export const fuenteSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  type: z.enum(["rss", "api", "html", "manual", "scraper"]),
});

export type Fuente = z.infer<typeof fuenteSchema>;
