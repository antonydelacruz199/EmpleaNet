import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEstrategicoResumen } from "./api";
import type { EstrategicoResumen } from "./tipos";

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
  const [resumen, setResumen] = useState<EstrategicoResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchEstrategicoResumen()
      .then(setResumen)
      .catch(() => setError("No se pudo cargar el panel estratégico."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Panel estratégico</h1>
        <p>
          Indicadores agregados para análisis institucional y mejora continua (Bizagi E3).
          Solo lectura.
        </p>
      </header>

      <div className="section-heading">
        <Link to="/admin/reportes">← Reportes operativos</Link>
      </div>

      {error ? <p className="alert">{error}</p> : null}
      {cargando ? (
        <p className="loading">Cargando indicadores...</p>
      ) : resumen ? (
        <>
          <div className="stats-grid">
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
        </>
      ) : null}
    </>
  );
}
