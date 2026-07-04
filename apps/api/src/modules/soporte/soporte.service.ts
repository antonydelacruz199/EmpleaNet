import type { AuthUser } from "../../core/auth/types.js";
import { AuditoriaRepository } from "../../core/auditoria/auditoria.repository.js";
import { AppError } from "../../core/errors/AppError.js";
import { RecomendacionesService } from "../recomendaciones/recomendaciones.service.js";
import { IncidenciasRepository } from "./incidencias.repository.js";
import {
  MotorConfigRepository,
  type MotorConfigBody,
} from "./motor-config.repository.js";
import type {
  ActualizarIncidenciaEstadoBody,
  CrearIncidenciaBody,
  RecalcularMotorResult,
} from "./soporte.schema.js";

export class SoporteService {
  private readonly motorConfigRepository = new MotorConfigRepository();
  private readonly incidenciasRepository = new IncidenciasRepository();
  private readonly recomendacionesService = new RecomendacionesService();
  private readonly auditoriaRepository = new AuditoriaRepository();

  getMotorConfig() {
    return this.motorConfigRepository.get();
  }

  updateMotorConfig(auth: AuthUser, body: MotorConfigBody) {
    const config = this.motorConfigRepository.update(body);
    this.auditoriaRepository.registrar({
      usuarioId: auth.userId,
      accion: "motor_config_actualizada",
      entidad: "motor_config",
      detalle: JSON.stringify(body),
    });
    return config;
  }

  async recalcularRecomendaciones(auth: AuthUser): Promise<RecalcularMotorResult> {
    const perfilesRecalculados =
      await this.recomendacionesService.recalcularTodos();
    this.auditoriaRepository.registrar({
      usuarioId: auth.userId,
      accion: "motor_recalculo_global",
      entidad: "recomendacion",
      detalle: `Perfiles recalculados: ${perfilesRecalculados}`,
    });
    return { perfilesRecalculados };
  }

  listIncidencias() {
    return { incidencias: this.incidenciasRepository.list() };
  }

  createIncidencia(auth: AuthUser, body: CrearIncidenciaBody) {
    const incidencia = this.incidenciasRepository.create(
      auth.userId,
      body.titulo,
      body.descripcion,
    );
    this.auditoriaRepository.registrar({
      usuarioId: auth.userId,
      accion: "incidencia_registrada",
      entidad: "incidencia",
      detalle: body.titulo,
    });
    return incidencia;
  }

  updateIncidenciaEstado(idRaw: string, body: ActualizarIncidenciaEstadoBody) {
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(400, "Identificador no válido");
    }
    return this.incidenciasRepository.updateEstado(id, body.estado);
  }

  listAuditoria(limit = 50) {
    return { registros: this.auditoriaRepository.listRecientes(limit) };
  }
}
