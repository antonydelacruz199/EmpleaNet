import type { AuthUser } from "../../core/auth/types.js";
import { AuditoriaRepository } from "../../core/auditoria/auditoria.repository.js";
import { AppError } from "../../core/errors/AppError.js";
import {
  assertPuedeCerrar,
  assertPuedeClasificar,
  assertPuedePublicar,
  assertPuedeRechazar,
  assertPuedeValidar,
} from "./ofertas.workflow.js";
import { OfertasRepository } from "./ofertas.repository.js";
import type {
  ClasificarOfertaBody,
  CreateEmpresaBody,
  CreateFuenteBody,
  CreateOfertaBody,
  ListOfertasAdminQuery,
  RechazarOfertaBody,
  UpdateEmpresaBody,
  UpdateFuenteBody,
  UpdateOfertaBody,
} from "./ofertas.schema.js";

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "Identificador no válido");
  }
  return id;
}

export class OfertasService {
  private readonly repo = new OfertasRepository();
  private readonly auditoria = new AuditoriaRepository();

  private getOr404(id: number) {
    const oferta = this.repo.findById(id);
    if (!oferta) throw new AppError(404, "Oferta no encontrada");
    return oferta;
  }

  list(query: ListOfertasAdminQuery) {
    const ofertas = this.repo.listAdmin(query);
    return { ofertas, total: ofertas.length };
  }

  resumen() {
    return this.repo.resumenAdmin();
  }

  get(idRaw: string) {
    return this.getOr404(parseId(idRaw));
  }

  create(auth: AuthUser, data: CreateOfertaBody) {
    const oferta = this.repo.create(data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_creada",
      entidad: "empleo",
      detalle: `${oferta.id}:${oferta.estado}`,
    });
    return oferta;
  }

  update(auth: AuthUser, idRaw: string, data: UpdateOfertaBody) {
    const oferta = this.repo.update(parseId(idRaw), data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_actualizada",
      entidad: "empleo",
      detalle: idRaw,
    });
    return oferta;
  }

  validar(auth: AuthUser, idRaw: string) {
    const id = parseId(idRaw);
    const oferta = this.getOr404(id);
    assertPuedeValidar(oferta);
    const actualizada = this.repo.validar(id);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_validada",
      entidad: "empleo",
      detalle: idRaw,
    });
    return actualizada;
  }

  clasificar(auth: AuthUser, idRaw: string, data: ClasificarOfertaBody) {
    const id = parseId(idRaw);
    const oferta = this.getOr404(id);
    assertPuedeClasificar(oferta);
    const actualizada = this.repo.clasificar(id, data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_clasificada",
      entidad: "empleo",
      detalle: idRaw,
    });
    return actualizada;
  }

  publicar(auth: AuthUser, idRaw: string) {
    const id = parseId(idRaw);
    const oferta = this.getOr404(id);
    assertPuedePublicar(oferta);
    const actualizada = this.repo.publicar(id);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_publicada",
      entidad: "empleo",
      detalle: idRaw,
    });
    return actualizada;
  }

  rechazar(auth: AuthUser, idRaw: string, data: RechazarOfertaBody) {
    const id = parseId(idRaw);
    const oferta = this.getOr404(id);
    assertPuedeRechazar(oferta);
    const actualizada = this.repo.rechazar(id, data.motivo);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_rechazada",
      entidad: "empleo",
      detalle: data.motivo,
    });
    return actualizada;
  }

  cerrar(auth: AuthUser, idRaw: string) {
    const id = parseId(idRaw);
    const oferta = this.getOr404(id);
    assertPuedeCerrar(oferta);
    const actualizada = this.repo.cerrar(id);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "oferta_cerrada",
      entidad: "empleo",
      detalle: idRaw,
    });
    return actualizada;
  }

  archivar(auth: AuthUser, idRaw: string, activo: boolean) {
    const id = parseId(idRaw);
    this.getOr404(id);
    const actualizada = this.repo.archivar(id, activo);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: activo ? "oferta_reactivada" : "oferta_archivada",
      entidad: "empleo",
      detalle: idRaw,
    });
    return actualizada;
  }

  listEmpresas() {
    return this.repo.listEmpresas();
  }

  createEmpresa(auth: AuthUser, data: CreateEmpresaBody) {
    const empresa = this.repo.createEmpresa(data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "empresa_creada",
      entidad: "empresa",
      detalle: empresa.nombre,
    });
    return empresa;
  }

  updateEmpresa(auth: AuthUser, idRaw: string, data: UpdateEmpresaBody) {
    const empresa = this.repo.updateEmpresa(parseId(idRaw), data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "empresa_actualizada",
      entidad: "empresa",
      detalle: idRaw,
    });
    return empresa;
  }

  listFuentes() {
    return this.repo.listFuentesAdmin();
  }

  createFuente(auth: AuthUser, data: CreateFuenteBody) {
    const fuente = this.repo.createFuente(data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "fuente_creada",
      entidad: "fuente_empleo",
      detalle: fuente.nombre,
    });
    return fuente;
  }

  updateFuente(auth: AuthUser, idRaw: string, data: UpdateFuenteBody) {
    const fuente = this.repo.updateFuente(parseId(idRaw), data);
    this.auditoria.registrar({
      usuarioId: auth.userId,
      accion: "fuente_actualizada",
      entidad: "fuente_empleo",
      detalle: idRaw,
    });
    return fuente;
  }
}
