import { getDb } from "../../core/db/conexion.js";
import type { Empleo } from "../empleos/empleos.schema.js";
import { EmpleosRepository } from "../empleos/empleos.repository.js";
import type { Perfil } from "../perfil/perfil.schema.js";
import { PerfilRepository } from "../perfil/perfil.repository.js";
import { calcularRecomendacion } from "./recomendacion.motor.js";
import { MotorConfigRepository } from "../soporte/motor-config.repository.js";
import type { RecomendacionItem } from "./recomendaciones.schema.js";

type RecomendacionRow = {
  puntaje: number;
  motivo: string | null;
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  modalidad: string | null;
  descripcion: string | null;
  url_oferta: string | null;
  salario: string | null;
  fecha_publicacion: string | null;
  fuente_nombre: string | null;
};

function mapEmpleo(row: RecomendacionRow): Empleo {
  return {
    id: String(row.id),
    title: row.titulo,
    company: row.empresa,
    location: row.ubicacion ?? undefined,
    modalidad: row.modalidad ?? undefined,
    descripcion: row.descripcion ?? undefined,
    urlOferta: row.url_oferta ?? undefined,
    salario: row.salario ?? undefined,
    fechaPublicacion: row.fecha_publicacion ?? undefined,
    fuenteNombre: row.fuente_nombre ?? undefined,
  };
}

export class RecomendacionesRepository {
  private readonly empleosRepository = new EmpleosRepository();
  private readonly perfilRepository = new PerfilRepository();
  private readonly motorConfigRepository = new MotorConfigRepository();

  getPerfilById(perfilId: number): Perfil | null {
    return this.perfilRepository.findById(perfilId);
  }

  async findAllEmpleos() {
    return this.empleosRepository.findAll();
  }

  replaceScores(
    perfilId: number,
    items: { empleoId: number; puntaje: number; motivo: string }[],
  ): void {
    const db = getDb();
    const tx = db.transaction(() => {
      db.prepare("DELETE FROM recomendacion WHERE perfil_id = ?").run(perfilId);
      const stmt = db.prepare(
        `INSERT INTO recomendacion (perfil_id, empleo_id, puntaje, motivo)
         VALUES (?, ?, ?, ?)`,
      );
      for (const item of items) {
        stmt.run(perfilId, item.empleoId, item.puntaje, item.motivo);
      }
    });
    tx();
  }

  findByPerfil(perfilId: number, limit: number): RecomendacionItem[] {
    const rows = getDb()
      .prepare(
        `SELECT r.puntaje, r.motivo,
                e.id, e.titulo, e.empresa, e.ubicacion, e.modalidad, e.descripcion,
                e.url_oferta, e.salario, e.fecha_publicacion, f.nombre AS fuente_nombre
         FROM recomendacion r
         INNER JOIN empleo e ON e.id = r.empleo_id
         LEFT JOIN fuente_empleo f ON f.id = e.fuente_id
         WHERE r.perfil_id = ?
         ORDER BY r.puntaje DESC, e.id ASC
         LIMIT ?`,
      )
      .all(perfilId, limit) as RecomendacionRow[];

    return rows.map((row) => ({
      puntaje: row.puntaje,
      motivo: row.motivo ?? "",
      empleo: mapEmpleo(row),
    }));
  }

  countByPerfil(perfilId: number): number {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS c FROM recomendacion WHERE perfil_id = ?")
      .get(perfilId) as { c: number };
    return row.c;
  }

  buildScoresFromEmpleos(
    perfil: Perfil,
    empleos: Empleo[],
  ): { empleoId: number; puntaje: number; motivo: string }[] {
    const pesos = this.motorConfigRepository.getPesos();
    return empleos.map((empleo) => {
      const resultado = calcularRecomendacion(
        {
          skills: perfil.skills,
          location: perfil.location,
          carreraNombre: perfil.carreraNombre,
          intereses: perfil.intereses,
          aniosExperiencia: perfil.aniosExperiencia,
        },
        {
          title: empleo.title,
          descripcion: empleo.descripcion,
          modalidad: empleo.modalidad,
          ubicacion: empleo.location,
          fechaPublicacion: empleo.fechaPublicacion,
        },
        pesos,
      );
      return {
        empleoId: Number(empleo.id),
        puntaje: resultado.puntaje,
        motivo: resultado.motivo,
      };
    });
  }

  listPerfilIds(): number[] {
    const rows = getDb()
      .prepare("SELECT id FROM perfil ORDER BY id")
      .all() as { id: number }[];
    return rows.map((r) => r.id);
  }
}
