import { z } from "zod";
import { getDb } from "../../core/db/conexion.js";
import { ensureFase6Schema } from "../../core/auditoria/auditoria.repository.js";
import { ensureRecommendationSchema } from "../recomendaciones/ensureRecommendationSchema.js";
import { AppError } from "../../core/errors/AppError.js";
import type { PesosMotor } from "../recomendaciones/recommendation.engine.js";
import { PESOS_O3 } from "../recomendaciones/recommendation.engine.js";

type MotorConfigRow = {
  habilidades: number;
  carrera: number;
  experiencia: number;
  modalidad: number;
  ubicacion: number;
  actualidad: number;
  intereses: number | null;
  actualizado_en: string;
};

export const motorConfigBodySchema = z.object({
  habilidades: z.number().min(0).max(100),
  carrera: z.number().min(0).max(100),
  intereses: z.number().min(0).max(100).optional(),
  /** @deprecated usar intereses */
  actualidad: z.number().min(0).max(100).optional(),
  experiencia: z.number().min(0).max(100),
  modalidad: z.number().min(0).max(100),
  ubicacion: z.number().min(0).max(100),
});

export type MotorConfigBody = z.infer<typeof motorConfigBodySchema>;

export type MotorConfig = PesosMotor & {
  actualidad?: number;
  actualizadoEn: string;
  total: number;
};

function mapRow(row: MotorConfigRow): MotorConfig {
  const intereses = row.intereses ?? row.actualidad ?? PESOS_O3.intereses;
  return {
    habilidades: row.habilidades,
    carrera: row.carrera,
    intereses,
    experiencia: row.experiencia,
    modalidad: row.modalidad,
    ubicacion: row.ubicacion,
    actualidad: row.actualidad,
    actualizadoEn: row.actualizado_en,
    total:
      row.habilidades +
      row.carrera +
      intereses +
      row.experiencia +
      row.modalidad +
      row.ubicacion,
  };
}

export class MotorConfigRepository {
  get(): MotorConfig {
    ensureFase6Schema();
    ensureRecommendationSchema();
    const row = getDb()
      .prepare(
        `SELECT habilidades, carrera, experiencia, modalidad, ubicacion,
                actualidad, intereses, actualizado_en
         FROM motor_config WHERE id = 1`,
      )
      .get() as MotorConfigRow | undefined;
    if (!row) {
      return { ...PESOS_O3, actualizadoEn: new Date().toISOString(), total: 100 };
    }
    return mapRow(row);
  }

  getPesos(): PesosMotor & { actualidad?: number } {
    const config = this.get();
    return {
      habilidades: config.habilidades,
      carrera: config.carrera,
      intereses: config.intereses,
      experiencia: config.experiencia,
      modalidad: config.modalidad,
      ubicacion: config.ubicacion,
      actualidad: config.actualidad,
    };
  }

  update(data: MotorConfigBody): MotorConfig {
    ensureFase6Schema();
    ensureRecommendationSchema();
    const intereses = data.intereses ?? data.actualidad ?? PESOS_O3.intereses;
    const total =
      data.habilidades +
      data.carrera +
      intereses +
      data.experiencia +
      data.modalidad +
      data.ubicacion;
    if (Math.abs(total - 100) > 0.01) {
      throw new AppError(
        422,
        "La suma de ponderaciones debe ser 100 (actual: " + total.toFixed(1) + ")",
      );
    }
    getDb()
      .prepare(
        `UPDATE motor_config SET
          habilidades = ?, carrera = ?, intereses = ?, experiencia = ?,
          modalidad = ?, ubicacion = ?, actualidad = 0,
          actualizado_en = CURRENT_TIMESTAMP
         WHERE id = 1`,
      )
      .run(
        data.habilidades,
        data.carrera,
        intereses,
        data.experiencia,
        data.modalidad,
        data.ubicacion,
      );
    return this.get();
  }
}
