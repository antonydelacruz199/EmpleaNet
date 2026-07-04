import type { AuthUser } from "../../core/auth/types.js";
import type {
  EstrategicoResumen,
  ListReporteResult,
  ReporteOfertaItem,
  ReportePostulacionItem,
  ReporteRecomendacionItem,
  ReporteUsuarioItem,
  ReportesFiltros,
  ReportesKpis,
  ReportesResumen,
} from "./admin.schema.js";
import { PerfilService } from "../perfil/perfil.service.js";
import { AdminRepository } from "./admin.repository.js";
import { OfertasService } from "../ofertas/ofertas.service.js";
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
} from "../ofertas/ofertas.schema.js";

export class AdminService {
  private readonly repository = new AdminRepository();
  private readonly ofertasService = new OfertasService();
  private readonly perfilService = new PerfilService();

  listEmpleos(query: ListOfertasAdminQuery = {}) {
    return this.ofertasService.list(query);
  }

  empleosResumen() {
    return this.ofertasService.resumen();
  }

  getEmpleo(idRaw: string) {
    return this.ofertasService.get(idRaw);
  }

  createEmpleo(auth: AuthUser, data: CreateOfertaBody) {
    return this.ofertasService.create(auth, data);
  }

  updateEmpleo(auth: AuthUser, idRaw: string, data: UpdateOfertaBody) {
    return this.ofertasService.update(auth, idRaw, data);
  }

  validarEmpleo(auth: AuthUser, idRaw: string) {
    return this.ofertasService.validar(auth, idRaw);
  }

  clasificarEmpleo(auth: AuthUser, idRaw: string, data: ClasificarOfertaBody) {
    return this.ofertasService.clasificar(auth, idRaw, data);
  }

  publicarEmpleo(auth: AuthUser, idRaw: string) {
    return this.ofertasService.publicar(auth, idRaw);
  }

  rechazarEmpleo(auth: AuthUser, idRaw: string, data: RechazarOfertaBody) {
    return this.ofertasService.rechazar(auth, idRaw, data);
  }

  cerrarEmpleo(auth: AuthUser, idRaw: string) {
    return this.ofertasService.cerrar(auth, idRaw);
  }

  setEmpleoActivo(auth: AuthUser, idRaw: string, activo: boolean) {
    return this.ofertasService.archivar(auth, idRaw, activo);
  }

  listEmpresas() {
    return this.ofertasService.listEmpresas();
  }

  createEmpresa(auth: AuthUser, data: CreateEmpresaBody) {
    return this.ofertasService.createEmpresa(auth, data);
  }

  updateEmpresa(auth: AuthUser, idRaw: string, data: UpdateEmpresaBody) {
    return this.ofertasService.updateEmpresa(auth, idRaw, data);
  }

  listFuentes() {
    return this.ofertasService.listFuentes();
  }

  createFuente(auth: AuthUser, data: CreateFuenteBody) {
    return this.ofertasService.createFuente(auth, data);
  }

  updateFuente(auth: AuthUser, idRaw: string, data: UpdateFuenteBody) {
    return this.ofertasService.updateFuente(auth, idRaw, data);
  }

  getReportesResumen(filtros: ReportesFiltros = {}): ReportesResumen {
    return this.repository.getReportesResumen(filtros);
  }

  getReportesKpis(filtros: ReportesFiltros = {}): ReportesKpis {
    return this.repository.getReportesKpis(filtros);
  }

  getReporteUsuarios(filtros: ReportesFiltros = {}): ListReporteResult<ReporteUsuarioItem> {
    return this.repository.getReporteUsuarios(filtros);
  }

  getReporteOfertas(filtros: ReportesFiltros = {}): ListReporteResult<ReporteOfertaItem> {
    return this.repository.getReporteOfertas(filtros);
  }

  getReporteRecomendaciones(
    filtros: ReportesFiltros = {},
  ): ListReporteResult<ReporteRecomendacionItem> {
    return this.repository.getReporteRecomendaciones(filtros);
  }

  getReportePostulaciones(
    filtros: ReportesFiltros = {},
  ): ListReporteResult<ReportePostulacionItem> {
    return this.repository.getReportePostulaciones(filtros);
  }

  getEstrategicoResumen(filtros: ReportesFiltros = {}): EstrategicoResumen {
    return this.repository.getEstrategicoResumen(filtros);
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

  buildReportesExportPayload(filtros: ReportesFiltros = {}) {
    return {
      generadoEn: new Date().toISOString(),
      filtros,
      kpis: this.getReportesKpis(filtros),
      usuarios: this.getReporteUsuarios(filtros),
      ofertas: this.getReporteOfertas(filtros),
      recomendaciones: this.getReporteRecomendaciones(filtros),
      postulaciones: this.getReportePostulaciones(filtros),
    };
  }

  listUsuariosPerfil(page = 1) {
    return this.perfilService.listUsuariosAdmin(page);
  }

  getUsuarioPerfil(usuarioId: number) {
    return this.perfilService.getPerfilAdmin(usuarioId);
  }
}
