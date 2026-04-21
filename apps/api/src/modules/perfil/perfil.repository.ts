import type { Perfil } from "./perfil.schema.js";

const perfilSeed: Perfil = {
  id: "perfil-1",
  name: "Ana Pérez",
  skills: ["typescript", "react", "nodejs"],
  location: "Remoto",
};

export class PerfilRepository {
  getCurrent(): Promise<Perfil> {
    return Promise.resolve(structuredClone(perfilSeed));
  }
}
