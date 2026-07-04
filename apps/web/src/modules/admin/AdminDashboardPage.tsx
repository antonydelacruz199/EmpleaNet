import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAdminEmpleosResumen,
  fetchEstrategicoResumen,
  fetchReportesKpis,
} from "./api";
import { BarChartSimple } from "./BarChartSimple";
import type { EstrategicoResumen, OfertasResumenAdmin, ReportesKpis } from "./tipos";

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<ReportesKpis | null>(null);
  const [ofertasResumen, setOfertasResumen] = useState<OfertasResumenAdmin | null>(null);
  const [estrategico, setEstrategico] = useState<EstrategicoResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchReportesKpis(),
      fetchAdminEmpleosResumen(),
      fetchEstrategicoResumen(),
    ])
      .then(([k, o, e]) => {
        setKpis(k);
        setOfertasResumen(o);
        setEstrategico(e);
      })
      .catch(() => setError("No se pudo cargar el dashboard administrativo."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Dashboard administrativo</h1>
        <p>
          Vista consolidada de KPIs, ofertas y alertas institucionales (O5 / E3).
        </p>
      </header>

      {error ? <p className="alert">{error}</p> : null}
      {cargando ? (
        <p className="loading">Cargando dashboard...</p>
      ) : kpis && ofertasResumen && estrategico ? (
        <>
          <div className="stats-grid">
            <div className="stat-card card">
              <span className="stat-card__label">Usuarios activos</span>
              <strong className="stat-card__value">{kpis.usuariosActivos}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Ofertas publicadas</span>
              <strong className="stat-card__value">{kpis.ofertasPublicadas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Postulaciones</span>
              <strong className="stat-card__value">{kpis.postulacionesRegistradas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Incidencias abiertas</span>
              <strong className="stat-card__value">{estrategico.incidenciasAbiertas}</strong>
            </div>
          </div>

          <div className="detail-grid" style={{ marginTop: 24 }}>
            <section className="card detail-main">
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Pipeline de ofertas</h2>
              <BarChartSimple
                items={[
                  { label: "Borrador", value: ofertasResumen.borrador },
                  { label: "Pend. validación", value: ofertasResumen.pendienteValidacion },
                  { label: "Validada", value: ofertasResumen.validada },
                  { label: "Publicada", value: ofertasResumen.publicada },
                  { label: "Cerrada", value: ofertasResumen.cerrada },
                ]}
              />
            </section>
            <aside className="card detail-sidebar">
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Accesos rápidos</h2>
              <Link to="/admin/reportes" className="btn btn--primary">
                Reportes detallados
              </Link>
              <Link to="/admin/estrategico" className="btn btn--secondary">
                Panel estratégico
              </Link>
              <Link to="/admin/ofertas" className="btn btn--secondary">
                Gestión de ofertas
              </Link>
              <Link to="/admin/usuarios" className="btn btn--secondary">
                Usuarios y perfiles
              </Link>
            </aside>
          </div>

          {estrategico.mejorasSugeridas.length > 0 ? (
            <section className="card detail-main" style={{ marginTop: 24 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Acciones sugeridas</h2>
              <ul>
                {estrategico.mejorasSugeridas.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  );
}
