import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { RecomendacionesService } from "../recomendaciones/recomendaciones.service.js";
import { PerfilRepository } from "./perfil.repository.js";
import type {
  CreateExperienciaBody,
  UpdateExperienciaBody,
  UpdateInteresesBody,
  UpdatePerfilBody,
  UpdateSkillsBody,
  UploadCvBody,
} from "./perfil.schema.js";

export class PerfilService {
  private readonly perfilRepository = new PerfilRepository();
  private readonly recomendacionesService = new RecomendacionesService();

  private requirePerfilId(auth: AuthUser): number {
    if (!auth.perfilId) {
      throw new AppError(404, "Perfil no disponible para este usuario");
    }
    return auth.perfilId;
  }

  private async recalcularSiAplica(perfilId: number, completo: boolean) {
    if (completo) {
      await this.recomendacionesService.recalcularParaPerfil(perfilId);
    }
  }

  async getMe(auth: AuthUser) {
    const perfilId = this.requirePerfilId(auth);
    return this.perfilRepository.getByIdForUser(perfilId, auth.userId);
  }

  async getCompletitud(auth: AuthUser) {
    const perfil = await this.getMe(auth);
    return perfil.completitud;
  }

  async updateMe(auth: AuthUser, data: UpdatePerfilBody) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.updatePersonal(perfilId, auth.userId, data);
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  async updateSkills(auth: AuthUser, data: UpdateSkillsBody) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.replaceSkills(perfilId, auth.userId, data);
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  async updateIntereses(auth: AuthUser, data: UpdateInteresesBody) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.replaceIntereses(
      perfilId,
      auth.userId,
      data,
    );
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  async addExperiencia(auth: AuthUser, data: CreateExperienciaBody) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.addExperiencia(
      perfilId,
      auth.userId,
      data,
    );
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  async updateExperiencia(
    auth: AuthUser,
    expId: number,
    data: UpdateExperienciaBody,
  ) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.updateExperiencia(
      perfilId,
      auth.userId,
      expId,
      data,
    );
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  async deleteExperiencia(auth: AuthUser, expId: number) {
    const perfilId = this.requirePerfilId(auth);
    const perfil = this.perfilRepository.deleteExperiencia(
      perfilId,
      auth.userId,
      expId,
    );
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  async uploadCv(auth: AuthUser, data: UploadCvBody) {
    const perfilId = this.requirePerfilId(auth);
    const buffer = Buffer.from(data.contentBase64, "base64");
    if (buffer.length > 2 * 1024 * 1024) {
      throw new AppError(400, "El CV no puede superar 2 MB");
    }
    const perfil = this.perfilRepository.saveCv(
      perfilId,
      auth.userId,
      data.filename,
      buffer,
    );
    await this.recalcularSiAplica(perfilId, perfil.completitud.completo);
    return perfil;
  }

  getCvFile(auth: AuthUser) {
    const perfilId = this.requirePerfilId(auth);
    return this.perfilRepository.getCvPath(perfilId, auth.userId);
  }

  async deleteCv(auth: AuthUser) {
    const perfilId = this.requirePerfilId(auth);
    return this.perfilRepository.deleteCv(perfilId, auth.userId);
  }

  listCarreras() {
    return this.perfilRepository.listCarreras().map((c) => ({
      id: String(c.id),
      nombre: c.nombre,
      area: c.area ?? undefined,
    }));
  }

  getPerfilAdmin(usuarioId: number) {
    const perfil = this.perfilRepository.getByUsuarioId(usuarioId);
    if (!perfil) throw new AppError(404, "Perfil no encontrado");
    return perfil;
  }

  listUsuariosAdmin(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const rows = this.perfilRepository.listUsuariosConPerfil(limit, offset);
    return rows.map((r) => ({
      id: String(r.id),
      email: r.email,
      rol: r.rol,
      name: r.nombre,
      perfilId: String(r.perfil_id),
      completitudPct: r.completitud_pct,
      perfilCompleto: r.perfil_completo === 1,
    }));
  }
}
