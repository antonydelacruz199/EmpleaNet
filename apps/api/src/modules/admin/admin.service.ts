import type { AuthUser } from "../../core/auth/types.js";
import { AuditoriaRepository } from "../../core/auditoria/auditoria.repository.js";
import { AppError } from "../../core/errors/AppError.js";
import type {
  CreateEmpleoAdminBody,
  EmpleoAdmin,
  EstrategicoResumen,
  ListEmpleosAdminResult,
  ReportesResumen,
  UpdateEmpleoActivoBody,
  UpdateEmpleoAdminBody,
} from "./admin.schema.js";
import { PerfilService } from "../perfil/perfil.service.js";
import { AdminRepository } from "./admin.repository.js";

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "Identificador no válido");
  }
  return id;
}

export class AdminService {
  private readonly repository = new AdminRepository();
  private readonly auditoriaRepository = new AuditoriaRepository();
  private readonly perfilService = new PerfilService();

  listEmpleos(): ListEmpleosAdminResult {
    const empleos = this.repository.listEmpleos();
    return { empleos, total: empleos.length };
  }

  getEmpleo(idRaw: string): EmpleoAdmin {
    const empleo = this.repository.findEmpleoById(parseId(idRaw));
    if (!empleo) {
      throw new AppError(404, "Oferta no encontrada");
    }
    return empleo;
  }

  createEmpleo(auth: AuthUser, data: CreateEmpleoAdminBody): EmpleoAdmin {
    const empleo = this.repository.createManual(data);
    this.auditoriaRepository.registrar({
      usuarioId: auth.userId,
      accion: "empleo_creado",
      entidad: "empleo",
      detalle: `${empleo.id}:${empleo.title}`,
    });
    return empleo;
  }

  updateEmpleo(auth: AuthUser, idRaw: string, data: UpdateEmpleoAdminBody): EmpleoAdmin {
    const empleo = this.repository.updateEmpleo(parseId(idRaw), data);
    this.auditoriaRepository.registrar({
      usuarioId: auth.userId,
      accion: "empleo_actualizado",
      entidad: "empleo",
      detalle: idRaw,
    });
    return empleo;
  }

  setEmpleoActivo(
    auth: AuthUser,
    idRaw: string,
    data: UpdateEmpleoActivoBody,
  ): EmpleoAdmin {
    const empleo = this.repository.setActivo(parseId(idRaw), data.activo);
    this.auditoriaRepository.registrar({
      usuarioId: auth.userId,
      accion: data.activo ? "empleo_reactivado" : "empleo_archivado",
      entidad: "empleo",
      detalle: idRaw,
    });
    return empleo;
  }

  getReportesResumen(): ReportesResumen {
    return this.repository.getReportesResumen();
  }

  getEstrategicoResumen(): EstrategicoResumen {
    return this.repository.getEstrategicoResumen();
  }

  buildReportesCsv(resumen: ReportesResumen): string {
    const lines = [
      "Indicador,Valor",
      `Usuarios activos,${resumen.usuariosActivos}`,
      `Ofertas publicadas,${resumen.ofertasPublicadas}`,
      `Recomendaciones generadas,${resumen.recomendacionesGeneradas}`,
      `Postulaciones registradas,${resumen.postulacionesRegistradas}`,
      `Favoritos guardados,${resumen.favoritosGuardados}`,
      "",
      "Fuente,Ofertas activas",
      ...resumen.ofertasPorFuente.map((item) => `${item.fuente},${item.total}`),
    ];
    return lines.join("\n");
  }

  listUsuariosPerfil(page = 1) {
    return this.perfilService.listUsuariosAdmin(page);
  }

  getUsuarioPerfil(usuarioId: number) {
    return this.perfilService.getPerfilAdmin(usuarioId);
  }
}
