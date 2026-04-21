import type { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export function setupSecurity(app: Express) {
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}
