import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { RecomendacionesService } from "../recomendaciones/recomendaciones.service.js";
import { PerfilRepository } from "./perfil.repository.js";
import type { UpdatePerfilBody } from "./perfil.schema.js";

export class PerfilService {
  private readonly perfilRepository = new PerfilRepository();
  private readonly recomendacionesService = new RecomendacionesService();

  private requirePerfilId(auth: AuthUser): number {
    if (!auth.perfilId) {
      throw new AppError(404, "Perfil no disponible para este usuario");
    }
    return auth.perfilId;
  }

  async getMe(auth: AuthUser) {
    const perfilId = this.requirePerfilId(auth);
    return this.perfilRepository.getByIdForUser(perfilId, auth.userId);
  }

  async updateMe(auth: AuthUser, data: UpdatePerfilBody) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.updateById(
      perfilId,
      auth.userId,
      data,
    );
    await this.recomendacionesService.recalcularParaPerfil(perfilId);
    return perfil;
  }
}
