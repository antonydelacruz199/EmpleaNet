import { z } from "zod";
import { getDb } from "../../core/db/conexion.js";
import { ensureFase6Schema } from "../../core/auditoria/auditoria.repository.js";
import { AppError } from "../../core/errors/AppError.js";
import type { PesosMotor } from "../recomendaciones/recomendacion.motor.js";
import { PESOS_DEFAULT } from "../recomendaciones/recomendacion.motor.js";

type MotorConfigRow = {
  habilidades: number;
  carrera: number;
  experiencia: number;
  modalidad: number;
  ubicacion: number;
  actualidad: number;
  actualizado_en: string;
};

export const motorConfigBodySchema = z.object({
  habilidades: z.number().min(0).max(100),
  carrera: z.number().min(0).max(100),
  experiencia: z.number().min(0).max(100),
  modalidad: z.number().min(0).max(100),
  ubicacion: z.number().min(0).max(100),
  actualidad: z.number().min(0).max(100),
});

export type MotorConfigBody = z.infer<typeof motorConfigBodySchema>;

export type MotorConfig = PesosMotor & {
  actualizadoEn: string;
  total: number;
};

function mapRow(row: MotorConfigRow): MotorConfig {
  return {
    habilidades: row.habilidades,
    carrera: row.carrera,
    experiencia: row.experiencia,
    modalidad: row.modalidad,
    ubicacion: row.ubicacion,
    actualidad: row.actualidad,
    actualizadoEn: row.actualizado_en,
    total:
      row.habilidades +
      row.carrera +
      row.experiencia +
      row.modalidad +
      row.ubicacion +
      row.actualidad,
  };
}

export class MotorConfigRepository {
  get(): MotorConfig {
    ensureFase6Schema();
    const row = getDb()
      .prepare(
        `SELECT habilidades, carrera, experiencia, modalidad, ubicacion, actualidad, actualizado_en
         FROM motor_config WHERE id = 1`,
      )
      .get() as MotorConfigRow | undefined;
    if (!row) {
      return { ...PESOS_DEFAULT, actualizadoEn: new Date().toISOString(), total: 100 };
    }
    return mapRow(row);
  }

  getPesos(): PesosMotor {
    const config = this.get();
    return {
      habilidades: config.habilidades,
      carrera: config.carrera,
      experiencia: config.experiencia,
      modalidad: config.modalidad,
      ubicacion: config.ubicacion,
      actualidad: config.actualidad,
    };
  }

  update(data: MotorConfigBody): MotorConfig {
    ensureFase6Schema();
    const total =
      data.habilidades +
      data.carrera +
      data.experiencia +
      data.modalidad +
      data.ubicacion +
      data.actualidad;
    if (Math.abs(total - 100) > 0.01) {
      throw new AppError(
        422,
        "La suma de ponderaciones debe ser 100 (actual: " + total.toFixed(1) + ")",
      );
    }
    getDb()
      .prepare(
        `UPDATE motor_config SET
          habilidades = ?, carrera = ?, experiencia = ?,
          modalidad = ?, ubicacion = ?, actualidad = ?,
          actualizado_en = CURRENT_TIMESTAMP
         WHERE id = 1`,
      )
      .run(
        data.habilidades,
        data.carrera,
        data.experiencia,
        data.modalidad,
        data.ubicacion,
        data.actualidad,
      );
    return this.get();
  }
}
