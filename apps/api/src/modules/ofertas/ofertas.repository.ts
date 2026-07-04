import { getDb } from "../../core/db/conexion.js";
import { AppError } from "../../core/errors/AppError.js";
import {
  ensureOffersSchema,
  SQL_OFERTA_PUBLICA,
  syncOfertasVencidas,
} from "./ensureOffersSchema.js";
import {
  isOfertaVencida,
  parseSkills,
  serializeSkills,
} from "./ofertas.workflow.js";
import type {
  ClasificarOfertaBody,
  CreateEmpresaBody,
  CreateFuenteBody,
  CreateOfertaBody,
  Empresa,
  FuenteAdmin,
  ListOfertasAdminQuery,
  OfertaAdmin,
  OfertasResumenAdmin,
  UpdateEmpresaBody,
  UpdateFuenteBody,
  UpdateOfertaBody,
} from "./ofertas.schema.js";

type OfertaRow = {
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  modalidad: string | null;
  categoria: string | null;
  tipo_oportunidad: string | null;
  descripcion: string | null;
  url_oferta: string | null;
  salario: string | null;
  fecha_publicacion: string | null;
  fecha_cierre: string | null;
  fuente_id: number;
  fuente_nombre: string | null;
  empresa_id: number | null;
  estado: string;
  motivo_rechazo: string | null;
  habilidades_requeridas: string | null;
  activo: number;
  creado_en: string;
  validado_en: string | null;
  publicado_en: string | null;
};

const selectCols = `e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.categoria,
  e.tipo_oportunidad, e.descripcion, e.url_oferta, e.salario, e.fecha_publicacion,
  e.fecha_cierre, e.fuente_id, f.nombre AS fuente_nombre, e.empresa_id, e.estado,
  e.motivo_rechazo, e.habilidades_requeridas, e.activo, e.creado_en, e.validado_en, e.publicado_en`;

const fromJoin = `FROM empleo e LEFT JOIN fuente_empleo f ON f.id = e.fuente_id`;

function mapRow(row: OfertaRow): OfertaAdmin {
  return {
    id: String(row.id),
    title: row.titulo,
    company: row.empresa,
    location: row.ubicacion ?? undefined,
    modalidad: row.modalidad ?? undefined,
    categoria: row.categoria ?? undefined,
    tipoOportunidad: row.tipo_oportunidad ?? undefined,
    descripcion: row.descripcion ?? undefined,
    urlOferta: row.url_oferta ?? undefined,
    salario: row.salario ?? undefined,
    fechaPublicacion: row.fecha_publicacion ?? undefined,
    fechaCierre: row.fecha_cierre ?? undefined,
    fuenteId: String(row.fuente_id),
    fuenteNombre: row.fuente_nombre ?? undefined,
    empresaId: row.empresa_id ? String(row.empresa_id) : undefined,
    estado: row.estado as OfertaAdmin["estado"],
    motivoRechazo: row.motivo_rechazo ?? undefined,
    habilidadesRequeridas: parseSkills(row.habilidades_requeridas),
    activo: row.activo === 1,
    vencida: isOfertaVencida(row.fecha_cierre ?? undefined),
    creadoEn: row.creado_en,
    validadoEn: row.validado_en ?? undefined,
    publicadoEn: row.publicado_en ?? undefined,
  };
}

export class OfertasRepository {
  init(): void {
    ensureOffersSchema();
    syncOfertasVencidas();
  }

  findById(id: number): OfertaAdmin | null {
    this.init();
    const row = getDb()
      .prepare(`SELECT ${selectCols} ${fromJoin} WHERE e.id = ?`)
      .get(id) as OfertaRow | undefined;
    return row ? mapRow(row) : null;
  }

  listAdmin(query: ListOfertasAdminQuery): OfertaAdmin[] {
    this.init();
    const conds: string[] = [];
    const values: (string | number)[] = [];
    if (query.estado) {
      conds.push("e.estado = ?");
      values.push(query.estado);
    }
    if (query.modalidad) {
      conds.push("e.modalidad = ?");
      values.push(query.modalidad);
    }
    if (query.categoria) {
      conds.push("e.categoria = ?");
      values.push(query.categoria);
    }
    if (query.tipo) {
      conds.push("e.tipo_oportunidad = ?");
      values.push(query.tipo);
    }
    if (query.fuente) {
      conds.push("LOWER(f.nombre) LIKE ?");
      values.push(`%${query.fuente.toLowerCase()}%`);
    }
    if (query.q) {
      conds.push(
        "(LOWER(e.titulo) LIKE ? OR LOWER(e.empresa) LIKE ?)",
      );
      const t = `%${query.q.toLowerCase()}%`;
      values.push(t, t);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const rows = getDb()
      .prepare(
        `SELECT ${selectCols} ${fromJoin} ${where} ORDER BY e.id DESC`,
      )
      .all(...values) as OfertaRow[];
    return rows.map(mapRow);
  }

  resumenAdmin(): OfertasResumenAdmin {
    this.init();
    const rows = getDb()
      .prepare(`SELECT estado, COUNT(*) AS c FROM empleo GROUP BY estado`)
      .all() as { estado: string; c: number }[];
    const count = (estado: string) =>
      rows.find((r) => r.estado === estado)?.c ?? 0;
    const total = rows.reduce((a, r) => a + r.c, 0);
    return {
      total,
      borrador: count("borrador"),
      pendienteValidacion: count("pendiente_validacion"),
      validada: count("validada"),
      publicada: count("publicada"),
      rechazada: count("rechazada"),
      cerrada: count("cerrada"),
      archivada: count("archivada"),
    };
  }

  create(data: CreateOfertaBody): OfertaAdmin {
    this.init();
    const result = getDb()
      .prepare(
        `INSERT INTO empleo (fuente_id, titulo, empresa, empresa_id, ubicacion, modalidad,
         categoria, tipo_oportunidad, descripcion, url_oferta, salario, fecha_publicacion,
         fecha_cierre, habilidades_requeridas, estado, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', 0)`,
      )
      .run(
        data.fuenteId,
        data.title,
        data.company,
        data.empresaId ?? null,
        data.location ?? null,
        data.modalidad ?? null,
        data.categoria ?? null,
        data.tipoOportunidad ?? null,
        data.descripcion ?? null,
        data.urlOferta ?? null,
        data.salario ?? null,
        data.fechaPublicacion ?? null,
        data.fechaCierre ?? null,
        data.habilidadesRequeridas?.length
          ? serializeSkills(data.habilidadesRequeridas)
          : null,
      );
    return this.findById(Number(result.lastInsertRowid))!;
  }

  update(id: number, data: UpdateOfertaBody): OfertaAdmin {
    if (!this.findById(id)) throw new AppError(404, "Oferta no encontrada");
    getDb()
      .prepare(
        `UPDATE empleo SET
          titulo = COALESCE(?, titulo),
          empresa = COALESCE(?, empresa),
          fuente_id = COALESCE(?, fuente_id),
          empresa_id = COALESCE(?, empresa_id),
          ubicacion = COALESCE(?, ubicacion),
          modalidad = COALESCE(?, modalidad),
          categoria = COALESCE(?, categoria),
          tipo_oportunidad = COALESCE(?, tipo_oportunidad),
          descripcion = COALESCE(?, descripcion),
          url_oferta = COALESCE(?, url_oferta),
          salario = COALESCE(?, salario),
          fecha_publicacion = COALESCE(?, fecha_publicacion),
          fecha_cierre = COALESCE(?, fecha_cierre),
          habilidades_requeridas = COALESCE(?, habilidades_requeridas)
         WHERE id = ?`,
      )
      .run(
        data.title ?? null,
        data.company ?? null,
        data.fuenteId ?? null,
        data.empresaId ?? null,
        data.location ?? null,
        data.modalidad ?? null,
        data.categoria ?? null,
        data.tipoOportunidad ?? null,
        data.descripcion ?? null,
        data.urlOferta ?? null,
        data.salario ?? null,
        data.fechaPublicacion ?? null,
        data.fechaCierre ?? null,
        data.habilidadesRequeridas
          ? serializeSkills(data.habilidadesRequeridas)
          : null,
        id,
      );
    return this.findById(id)!;
  }

  validar(id: number): OfertaAdmin {
    const now = new Date().toISOString();
    getDb()
      .prepare(
        `UPDATE empleo SET estado = 'validada', validado_en = ?, activo = 0 WHERE id = ?`,
      )
      .run(now, id);
    return this.findById(id)!;
  }

  clasificar(id: number, data: ClasificarOfertaBody): OfertaAdmin {
    getDb()
      .prepare(
        `UPDATE empleo SET modalidad = ?, categoria = ?, tipo_oportunidad = ?,
         habilidades_requeridas = ? WHERE id = ?`,
      )
      .run(
        data.modalidad,
        data.categoria,
        data.tipoOportunidad,
        serializeSkills(data.habilidadesRequeridas),
        id,
      );
    return this.findById(id)!;
  }

  publicar(id: number): OfertaAdmin {
    const now = new Date().toISOString();
    getDb()
      .prepare(
        `UPDATE empleo SET estado = 'publicada', publicado_en = ?, activo = 1 WHERE id = ?`,
      )
      .run(now, id);
    return this.findById(id)!;
  }

  rechazar(id: number, motivo: string): OfertaAdmin {
    getDb()
      .prepare(
        `UPDATE empleo SET estado = 'rechazada', motivo_rechazo = ?, activo = 0 WHERE id = ?`,
      )
      .run(motivo, id);
    return this.findById(id)!;
  }

  cerrar(id: number): OfertaAdmin {
    getDb()
      .prepare(
        `UPDATE empleo SET estado = 'cerrada', activo = 0 WHERE id = ?`,
      )
      .run(id);
    return this.findById(id)!;
  }

  archivar(id: number, activo: boolean): OfertaAdmin {
    getDb()
      .prepare(
        `UPDATE empleo SET activo = ?, estado = CASE WHEN ? = 0 THEN 'archivada' ELSE estado END WHERE id = ?`,
      )
      .run(activo ? 1 : 0, activo ? 1 : 0, id);
    return this.findById(id)!;
  }

  listEmpresas(): Empresa[] {
    this.init();
    const rows = getDb()
      .prepare(
        "SELECT id, nombre, sector, contacto_email, activa FROM empresa ORDER BY nombre",
      )
      .all() as {
      id: number;
      nombre: string;
      sector: string | null;
      contacto_email: string | null;
      activa: number;
    }[];
    return rows.map((r) => ({
      id: String(r.id),
      nombre: r.nombre,
      sector: r.sector ?? undefined,
      contactoEmail: r.contacto_email ?? undefined,
      activa: r.activa === 1,
    }));
  }

  createEmpresa(data: CreateEmpresaBody): Empresa {
    this.init();
    const result = getDb()
      .prepare(
        "INSERT INTO empresa (nombre, sector, contacto_email) VALUES (?, ?, ?)",
      )
      .run(data.nombre, data.sector ?? null, data.contactoEmail ?? null);
    return this.listEmpresas().find((e) => e.id === String(result.lastInsertRowid))!;
  }

  updateEmpresa(id: number, data: UpdateEmpresaBody): Empresa {
    this.init();
    getDb()
      .prepare(
        `UPDATE empresa SET nombre = COALESCE(?, nombre), sector = COALESCE(?, sector),
         contacto_email = COALESCE(?, contacto_email), activa = COALESCE(?, activa)
         WHERE id = ?`,
      )
      .run(
        data.nombre ?? null,
        data.sector ?? null,
        data.contactoEmail ?? null,
        data.activa === undefined ? null : data.activa ? 1 : 0,
        id,
      );
    const row = this.listEmpresas().find((e) => e.id === String(id));
    if (!row) throw new AppError(404, "Empresa no encontrada");
    return row;
  }

  listFuentesAdmin(): FuenteAdmin[] {
    this.init();
    const rows = getDb()
      .prepare("SELECT id, nombre, tipo, url, activa FROM fuente_empleo ORDER BY nombre")
      .all() as {
      id: number;
      nombre: string;
      tipo: string;
      url: string | null;
      activa: number;
    }[];
    return rows.map((r) => ({
      id: String(r.id),
      nombre: r.nombre,
      tipo: r.tipo,
      url: r.url ?? undefined,
      activa: r.activa === 1,
    }));
  }

  createFuente(data: CreateFuenteBody): FuenteAdmin {
    this.init();
    const result = getDb()
      .prepare(
        "INSERT INTO fuente_empleo (nombre, tipo, url, activa) VALUES (?, ?, ?, 1)",
      )
      .run(data.nombre, data.tipo, data.url ?? null);
    return this.listFuentesAdmin().find((f) => f.id === String(result.lastInsertRowid))!;
  }

  updateFuente(id: number, data: UpdateFuenteBody): FuenteAdmin {
    this.init();
    getDb()
      .prepare(
        `UPDATE fuente_empleo SET nombre = COALESCE(?, nombre), tipo = COALESCE(?, tipo),
         url = COALESCE(?, url), activa = COALESCE(?, activa) WHERE id = ?`,
      )
      .run(
        data.nombre ?? null,
        data.tipo ?? null,
        data.url ?? null,
        data.activa === undefined ? null : data.activa ? 1 : 0,
        id,
      );
    const row = this.listFuentesAdmin().find((f) => f.id === String(id));
    if (!row) throw new AppError(404, "Fuente no encontrada");
    return row;
  }

  /** Para reportes: ofertas realmente publicadas y vigentes */
  countPublicadasVigentes(): number {
    this.init();
    syncOfertasVencidas();
    return (
      getDb()
        .prepare(`SELECT COUNT(*) AS c FROM empleo e WHERE ${SQL_OFERTA_PUBLICA}`)
        .get() as { c: number }
    ).c;
  }
}

export { SQL_OFERTA_PUBLICA, syncOfertasVencidas };
