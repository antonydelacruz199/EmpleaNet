import { RecomendacionesService } from "../recomendaciones/recomendaciones.service.js";
import { PerfilRepository } from "./perfil.repository.js";
import type { UpdatePerfilBody } from "./perfil.schema.js";

export class PerfilService {
  private readonly perfilRepository = new PerfilRepository();
  private readonly recomendacionesService = new RecomendacionesService();

  async getMe() {
    return this.perfilRepository.getCurrent();
  }

  async updateMe(data: UpdatePerfilBody) {
    const perfil = await this.perfilRepository.updateCurrent(data);
    await this.recomendacionesService.recalcularParaPerfil(Number(perfil.id));
    return perfil;
  }
}
