import { AppError } from "../../core/errors/AppError.js";
import type {
  ClasificarOfertaBody,
  CreateOfertaBody,
  EstadoOferta,
  OfertaAdmin,
} from "./ofertas.schema.js";

export type DatosMinimosOferta = Pick<
  OfertaAdmin,
  | "title"
  | "company"
  | "fuenteId"
  | "modalidad"
  | "categoria"
  | "tipoOportunidad"
  | "fechaCierre"
  | "descripcion"
>;

export function parseSkills(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function serializeSkills(skills: string[]): string {
  return skills.map((s) => s.trim().toLowerCase()).filter(Boolean).join(",");
}

export function validarDatosMinimos(oferta: DatosMinimosOferta): string[] {
  const errores: string[] = [];
  if (!oferta.title || oferta.title.length < 3) errores.push("Título (mín. 3 caracteres)");
  if (!oferta.company || oferta.company.length < 2) errores.push("Empresa");
  if (!oferta.fuenteId) errores.push("Fuente asociada");
  if (!oferta.modalidad) errores.push("Modalidad");
  if (!oferta.categoria) errores.push("Categoría");
  if (!oferta.tipoOportunidad) errores.push("Tipo de oportunidad");
  if (!oferta.fechaCierre) errores.push("Fecha de cierre");
  else if (oferta.fechaCierre < new Date().toISOString().slice(0, 10)) {
    errores.push("Fecha de cierre debe ser hoy o posterior");
  }
  if (!oferta.descripcion || oferta.descripcion.trim().length < 20) {
    errores.push("Descripción (mín. 20 caracteres)");
  }
  return errores;
}

export function assertPuedeValidar(oferta: OfertaAdmin): void {
  const errores = validarDatosMinimos(oferta);
  if (errores.length > 0) {
    throw new AppError(
      400,
      `La oferta no cumple datos mínimos: ${errores.join(", ")}`,
    );
  }
  if (!["borrador", "pendiente_validacion"].includes(oferta.estado)) {
    throw new AppError(400, "Solo se validan ofertas en borrador o pendientes");
  }
}

export function assertPuedePublicar(oferta: OfertaAdmin): void {
  assertPuedeValidar(oferta);
  if (oferta.estado !== "validada") {
    throw new AppError(400, "La oferta debe estar validada antes de publicar");
  }
}

export function assertPuedeClasificar(oferta: OfertaAdmin): void {
  if (["rechazada", "cerrada", "archivada"].includes(oferta.estado)) {
    throw new AppError(400, "No se puede clasificar una oferta cerrada o rechazada");
  }
}

export function assertPuedeRechazar(oferta: OfertaAdmin): void {
  if (["publicada", "cerrada", "archivada", "rechazada"].includes(oferta.estado)) {
    throw new AppError(400, "La oferta no puede rechazarse en este estado");
  }
}

export function assertPuedeCerrar(oferta: OfertaAdmin): void {
  if (oferta.estado !== "publicada") {
    throw new AppError(400, "Solo se cierran ofertas publicadas");
  }
}

export function isOfertaVencida(fechaCierre?: string): boolean {
  if (!fechaCierre) return false;
  return fechaCierre < new Date().toISOString().slice(0, 10);
}
