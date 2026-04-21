import type { Fuente } from "./fuentes.schema.js";

const fuentesSeed: Fuente[] = [
  { id: "f1", name: "RemotoJobs", enabled: true, type: "api" },
  { id: "f2", name: "TechFeed", enabled: true, type: "rss" },
];

export class FuentesRepository {
  listAll(): Promise<Fuente[]> {
    return Promise.resolve(structuredClone(fuentesSeed));
  }
}
