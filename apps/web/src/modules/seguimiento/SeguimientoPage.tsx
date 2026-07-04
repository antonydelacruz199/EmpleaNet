import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFavoritos } from "../favoritos/api";
import type { Favorito } from "../favoritos/tipos";
import { fetchPostulaciones } from "../postulaciones/api";
import { PostulacionesTable } from "../postulaciones/PostulacionesTable";
import type { Postulacion } from "../postulaciones/tipos";
import { formatearFecha } from "../postulaciones/utilidades";
import { fetchSeguimientoResumen, fetchVistas } from "./api";
import type { OportunidadVista, SeguimientoResumen } from "./api";

type Tab = "postuladas" | "guardadas" | "vistas";

export function SeguimientoPage() {
  const [tab, setTab] = useState<Tab>("postuladas");
  const [resumen, setResumen] = useState<SeguimientoResumen | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [vistas, setVistas] = useState<OportunidadVista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchSeguimientoResumen(),
      fetchPostulaciones(),
      fetchFavoritos(),
      fetchVistas(),
    ])
      .then(([resumenData, postData, favData, vistasData]) => {
        if (!cancelled) {
          setResumen(resumenData);
          setPostulaciones(postData.postulaciones);
          setFavoritos(favData.favoritos);
          setVistas(vistasData.vistas);
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar tu seguimiento de oportunidades.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Seguimiento de oportunidades</h1>
        <p>
          Panel unificado de oportunidades postuladas, guardadas y vistas recientemente.
        </p>
      </header>

      {cargando ? (
        <p className="loading">Cargando seguimiento...</p>
      ) : error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : (
        <>
          {resumen ? (
            <div className="stats-grid">
              <div className="stat-card card">
                <span className="stat-card__label">Postulaciones activas</span>
                <strong className="stat-card__value">{resumen.postulacionesActivas}</strong>
              </div>
              <div className="stat-card card">
                <span className="stat-card__label">Total postuladas</span>
                <strong className="stat-card__value">{resumen.postulaciones}</strong>
              </div>
              <div className="stat-card card">
                <span className="stat-card__label">Guardadas</span>
                <strong className="stat-card__value">{resumen.favoritos}</strong>
              </div>
              <div className="stat-card card">
                <span className="stat-card__label">Vistas</span>
                <strong className="stat-card__value">{resumen.vistas}</strong>
              </div>
            </div>
          ) : null}

          <div className="tabs" role="tablist" aria-label="Secciones de seguimiento">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "postuladas"}
              className={`tabs__btn${tab === "postuladas" ? " tabs__btn--active" : ""}`}
              onClick={() => setTab("postuladas")}
            >
              Postuladas ({postulaciones.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "guardadas"}
              className={`tabs__btn${tab === "guardadas" ? " tabs__btn--active" : ""}`}
              onClick={() => setTab("guardadas")}
            >
              Guardadas ({favoritos.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "vistas"}
              className={`tabs__btn${tab === "vistas" ? " tabs__btn--active" : ""}`}
              onClick={() => setTab("vistas")}
            >
              Vistas ({vistas.length})
            </button>
          </div>

          <section style={{ marginTop: 24 }}>
            {tab === "postuladas" ? (
              <PostulacionesTable items={postulaciones} />
            ) : null}

            {tab === "guardadas" ? (
              favoritos.length === 0 ? (
                <div className="card empty-state">
                  <p>No tienes ofertas guardadas.</p>
                  <Link to="/empleos" className="btn btn--primary">
                    Explorar oportunidades
                  </Link>
                </div>
              ) : (
                <div className="empleos-list">
                  {favoritos.map((item) => (
                    <article key={item.id} className="card empleo-card">
                      <div className="empleo-card__body">
                        <h2 className="empleo-card__title">
                          <Link to={`/empleos/${item.empleoId}`}>{item.empleo.title}</Link>
                        </h2>
                        <p className="empleo-card__company">{item.empleo.company}</p>
                        <p className="empleo-card__source">
                          Guardado el {formatearFecha(item.creadoEn)}
                        </p>
                      </div>
                      <div className="empleo-card__actions">
                        <Link
                          to={`/empleos/${item.empleoId}`}
                          className="btn btn--secondary btn--sm"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : null}

            {tab === "vistas" ? (
              vistas.length === 0 ? (
                <div className="card empty-state">
                  <p>Aún no has consultado detalle de oportunidades.</p>
                  <Link to="/empleos" className="btn btn--primary">
                    Explorar oportunidades
                  </Link>
                </div>
              ) : (
                <div className="empleos-list">
                  {vistas.map((item) => (
                    <article key={item.id} className="card empleo-card">
                      <div className="empleo-card__body">
                        <h2 className="empleo-card__title">
                          <Link to={`/empleos/${item.empleoId}`}>{item.empleo.title}</Link>
                        </h2>
                        <p className="empleo-card__company">{item.empleo.company}</p>
                        <p className="empleo-card__source">
                          Vista el {formatearFecha(item.vistoEn)}
                        </p>
                      </div>
                      <div className="empleo-card__actions">
                        <Link
                          to={`/empleos/${item.empleoId}`}
                          className="btn btn--secondary btn--sm"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : null}
          </section>
        </>
      )}
    </>
  );
}
