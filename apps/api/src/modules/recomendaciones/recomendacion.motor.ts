/**
 * @deprecated Importar desde recommendation.engine.ts
 * Re-export para compatibilidad con Fase 6 (motor-config, soporte).
 */
export {
  PESOS_O3 as PESOS_DEFAULT,
  calcularRecomendacion,
  interpretarNivel,
  etiquetaNivel,
  normalizarPesos,
  type PesosMotor,
  type EntradaPerfilMotor,
  type EntradaEmpleoMotor,
  type ResultadoMotor,
  type NivelCoincidencia,
  type DesglosePuntaje,
} from "./recommendation.engine.js";

/** Alias legacy: motor Fase 6 usaba actualidad en lugar de intereses */
export type PesosMotorLegacy = import("./recommendation.engine.js").PesosMotor & {
  actualidad?: number;
};
