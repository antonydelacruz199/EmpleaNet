import { PerfilRepository } from "./perfil.repository.js";

export class PerfilService {
  private readonly perfilRepository = new PerfilRepository();

  async getMe() {
    return this.perfilRepository.getCurrent();
  }
}
