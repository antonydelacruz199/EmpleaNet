import { AppError } from "../../core/errors/AppError.js";
import type {
  CreateEmpleoAdminBody,
  EmpleoAdmin,
  ListEmpleosAdminResult,
  ReportesResumen,
  UpdateEmpleoActivoBody,
  UpdateEmpleoAdminBody,
} from "./admin.schema.js";
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

  createEmpleo(data: CreateEmpleoAdminBody): EmpleoAdmin {
    return this.repository.createManual(data);
  }

  updateEmpleo(idRaw: string, data: UpdateEmpleoAdminBody): EmpleoAdmin {
    return this.repository.updateEmpleo(parseId(idRaw), data);
  }

  setEmpleoActivo(idRaw: string, data: UpdateEmpleoActivoBody): EmpleoAdmin {
    return this.repository.setActivo(parseId(idRaw), data.activo);
  }

  getReportesResumen(): ReportesResumen {
    return this.repository.getReportesResumen();
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
}
