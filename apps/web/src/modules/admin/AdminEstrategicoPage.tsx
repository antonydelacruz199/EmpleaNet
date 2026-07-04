import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatearFecha } from "../postulaciones/utilidades";
import { fetchEstrategicoResumen } from "./api";
import { BarChartSimple } from "./BarChartSimple";
import { ReportesFiltrosForm } from "./ReportesFiltrosForm";
import type { EstrategicoResumen, ReportesFiltros } from "./tipos";

function TablaConteos({
  titulo,
  items,
}: {
  titulo: string;
  items: { etiqueta: string; total: number }[];
}) {
  return (
    <section className="card detail-main">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>{titulo}</h2>
      {items.length === 0 ? (
        <p>Sin datos.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Etiqueta</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.etiqueta}>
                  <td>{item.etiqueta}</td>
                  <td>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AdminEstrategicoPage() {
  const [filtros, setFiltros] = useState<ReportesFiltros>({});
  const [resumen, setResumen] = useState<EstrategicoResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    void fetchEstrategicoResumen(filtros)
      .then((data) => {
        if (!cancelled) setResumen(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el panel estratégico.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filtros]);

  return (
    <>
      <header className="page-header">
        <h1>Panel estratégico</h1>
        <p>
          Indicadores agregados para análisis institucional y mejora continua (Bizagi E3).
        </p>
      </header>

      <div className="section-heading">
        <Link to="/admin/dashboard">← Dashboard admin</Link>
      </div>

      <ReportesFiltrosForm filtros={filtros} onChange={setFiltros} />

      {error ? <p className="alert">{error}</p> : null}
      {cargando ? (
        <p className="loading">Cargando indicadores...</p>
      ) : resumen ? (
        <>
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <div className="stat-card card">
              <span className="stat-card__label">Puntaje promedio recomendación</span>
              <strong className="stat-card__value">
                {resumen.recomendacionPuntajePromedio}
              </strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Postulaciones / oferta activa</span>
              <strong className="stat-card__value">
                {resumen.tasaPostulacionPorOferta}
              </strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Incidencias abiertas</span>
              <strong className="stat-card__value">{resumen.incidenciasAbiertas}</strong>
            </div>
          </div>

          <div className="detail-grid" style={{ marginTop: 24 }}>
            <section className="card detail-main">
              <BarChartSimple
                title="Usuarios por rol"
                items={resumen.usuariosPorRol.map((i) => ({
                  label: i.etiqueta,
                  value: i.total,
                }))}
              />
            </section>
            <section className="card detail-main">
              <BarChartSimple
                title="Postulaciones por estado"
                items={resumen.postulacionesPorEstado.map((i) => ({
                  label: i.etiqueta,
                  value: i.total,
                }))}
              />
            </section>
          </div>

          <div className="detail-grid" style={{ marginTop: 24 }}>
            <TablaConteos titulo="Usuarios por rol" items={resumen.usuariosPorRol} />
            <TablaConteos
              titulo="Postulaciones por estado"
              items={resumen.postulacionesPorEstado}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <TablaConteos
              titulo="Ofertas activas por modalidad"
              items={resumen.empleosPorModalidad}
            />
          </div>

          <section className="card detail-main" style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Incidencias pendientes</h2>
            {resumen.incidenciasRecientes.length === 0 ? (
              <p>No hay incidencias abiertas registradas.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.incidenciasRecientes.map((inc) => (
                      <tr key={inc.id}>
                        <td>{inc.titulo}</td>
                        <td>{inc.estado}</td>
                        <td>{formatearFecha(inc.creadoEn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card detail-main" style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Mejoras sugeridas</h2>
            <ul>
              {resumen.mejorasSugeridas.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </>
  );
}
