import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { downloadReportesCsv, fetchReportesResumen } from "./api";
import type { ReportesResumen } from "./tipos";

export function AdminReportesPage() {
  const [resumen, setResumen] = useState<ReportesResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchReportesResumen()
      .then((data) => {
        if (!cancelled) setResumen(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los indicadores.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExport() {
    setExportando(true);
    setError(null);
    try {
      await downloadReportesCsv();
    } catch {
      setError("No se pudo exportar el CSV.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Reportes institucionales</h1>
        <p>
          Indicadores de uso de la plataforma para gestión académica (Bizagi O5).
        </p>
      </header>

      <div className="section-heading">
        <Link to="/admin/ofertas">← Gestión de ofertas</Link>
        <button
          type="button"
          className="btn btn--primary"
          disabled={exportando || cargando}
          onClick={() => void handleExport()}
        >
          {exportando ? "Exportando..." : "Exportar CSV"}
        </button>
      </div>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      {cargando ? (
        <p className="loading">Cargando indicadores...</p>
      ) : resumen ? (
        <>
          <div className="stats-grid">
            <div className="stat-card card">
              <span className="stat-card__label">Usuarios activos</span>
              <strong className="stat-card__value">{resumen.usuariosActivos}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Ofertas publicadas</span>
              <strong className="stat-card__value">{resumen.ofertasPublicadas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Recomendaciones</span>
              <strong className="stat-card__value">
                {resumen.recomendacionesGeneradas}
              </strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Postulaciones</span>
              <strong className="stat-card__value">
                {resumen.postulacionesRegistradas}
              </strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Favoritos</span>
              <strong className="stat-card__value">{resumen.favoritosGuardados}</strong>
            </div>
          </div>

          <section className="card detail-main" style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Ofertas por fuente</h2>
            {resumen.ofertasPorFuente.length === 0 ? (
              <p>No hay ofertas activas registradas.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fuente</th>
                      <th>Ofertas activas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.ofertasPorFuente.map((item) => (
                      <tr key={item.fuente}>
                        <td>{item.fuente}</td>
                        <td>{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
