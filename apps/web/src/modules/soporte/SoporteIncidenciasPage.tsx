import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import { formatearFecha } from "../postulaciones/utilidades";
import {
  actualizarIncidenciaEstado,
  crearIncidencia,
  fetchAuditoria,
  fetchIncidencias,
} from "./api";
import type { Incidencia, RegistroAuditoria } from "./tipos";

function etiquetaEstado(estado: Incidencia["estado"]) {
  const map = {
    abierta: "Abierta",
    en_proceso: "En proceso",
    cerrada: "Cerrada",
  };
  return map[estado];
}

export function SoporteIncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    const [incData, audData] = await Promise.all([
      fetchIncidencias(),
      fetchAuditoria(20),
    ]);
    setIncidencias(incData.incidencias);
    setAuditoria(audData.registros);
  }

  useEffect(() => {
    void cargar()
      .catch(() => setMensaje("No se pudieron cargar incidencias."))
      .finally(() => setCargando(false));
  }, []);

  async function handleCrear(event: React.FormEvent) {
    event.preventDefault();
    setMensaje(null);
    try {
      await crearIncidencia({
        titulo,
        descripcion: descripcion || undefined,
      });
      setTitulo("");
      setDescripcion("");
      await cargar();
      setMensaje("Incidencia registrada.");
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "Error al registrar.");
    }
  }

  async function cambiarEstado(id: string, estado: Incidencia["estado"]) {
    try {
      await actualizarIncidenciaEstado(id, estado);
      await cargar();
    } catch {
      setMensaje("No se pudo actualizar el estado.");
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Incidencias y auditoría</h1>
        <p>Registro de incidencias técnicas (Bizagi S4) y trazabilidad básica del sistema.</p>
      </header>

      <div className="section-heading">
        <Link to="/soporte/motor">← Configuración del motor</Link>
      </div>

      <section className="card detail-main admin-form-card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Nueva incidencia</h2>
        <form className="admin-form" onSubmit={(e) => void handleCrear(e)}>
          <label>
            Título *
            <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </label>
          <label>
            Descripción
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn--primary">
            Registrar incidencia
          </button>
        </form>
        {mensaje ? <p className="detail-actions__msg">{mensaje}</p> : null}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Incidencias registradas</h2>
        {cargando ? (
          <p className="loading">Cargando...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titulo}</td>
                    <td>{etiquetaEstado(item.estado)}</td>
                    <td>{formatearFecha(item.creadoEn)}</td>
                    <td>
                      <select
                        value={item.estado}
                        onChange={(e) =>
                          void cambiarEstado(
                            item.id,
                            e.target.value as Incidencia["estado"],
                          )
                        }
                      >
                        <option value="abierta">Abierta</option>
                        <option value="en_proceso">En proceso</option>
                        <option value="cerrada">Cerrada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Auditoría reciente</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {auditoria.map((row) => (
                <tr key={row.id}>
                  <td>{formatearFecha(row.creadoEn)}</td>
                  <td>{row.accion}</td>
                  <td>{row.entidad ?? "—"}</td>
                  <td>{row.detalle ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
