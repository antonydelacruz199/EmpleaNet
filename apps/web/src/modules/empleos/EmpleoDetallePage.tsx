import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEmpleoById } from "./api";
import type { EmpleoDetalle } from "./tipos";

function etiquetaModalidad(modalidad?: string) {
  if (!modalidad) return "—";
  const map: Record<string, string> = {
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
  };
  return map[modalidad.toLowerCase()] ?? modalidad;
}

export function EmpleoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [empleo, setEmpleo] = useState<EmpleoDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("Identificador de oferta no válido.");
      setCargando(false);
      return;
    }
    let cancelled = false;
    void fetchEmpleoById(id)
      .then((data) => {
        if (!cancelled) setEmpleo(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se encontró la oportunidad solicitada.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (cargando) return <p className="loading">Cargando detalle...</p>;
  if (error) return <p className="alert" role="alert">{error}</p>;
  if (!empleo) return null;

  return (
    <>
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/empleos">Oportunidades</Link>
        <span className="breadcrumb__sep">›</span>
        <span className="breadcrumb__current">{empleo.title}</span>
      </nav>

      <div className="detail-grid">
        <article className="card detail-main">
          <h1>{empleo.title}</h1>
          {empleo.company ? (
            <p className="detail-main__company">{empleo.company}</p>
          ) : null}

          <div className="detail-meta-list">
            <span className="badge badge--modalidad">
              {etiquetaModalidad(empleo.modalidad)}
            </span>
            {empleo.location ? (
              <span className="badge badge--modalidad">{empleo.location}</span>
            ) : null}
          </div>

          {empleo.descripcion ? (
            <div className="detail-description">{empleo.descripcion}</div>
          ) : (
            <p className="detail-description">Sin descripción disponible.</p>
          )}
        </article>

        <aside className="card detail-sidebar">
          <dl>
            <dt>Fuente</dt>
            <dd>{empleo.fuenteNombre ?? "—"}</dd>

            <dt>Publicación</dt>
            <dd>{empleo.fechaPublicacion ?? "—"}</dd>

            <dt>Salario</dt>
            <dd>{empleo.salario ?? "No especificado"}</dd>
          </dl>

          {empleo.urlOferta ? (
            <a
              href={empleo.urlOferta}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Ver oferta original
            </a>
          ) : (
            <p className="empleo-card__source">Enlace original no disponible.</p>
          )}

          <Link to="/empleos" className="btn btn--secondary">
            Volver al marketplace
          </Link>
        </aside>
      </div>
    </>
  );
}
