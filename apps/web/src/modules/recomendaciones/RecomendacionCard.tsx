import { Link } from "react-router-dom";
import { claseNivel, etiquetaNivel, type Recomendacion } from "./tipos";

type Props = {
  item: Recomendacion;
};

export function RecomendacionCard({ item }: Props) {
  const { empleo, puntaje, nivel, razones, yaPostulado, desglose } = item;

  return (
    <article className="card card--hover empleo-card">
      <div className="empleo-card__footer" style={{ border: "none", paddingTop: 0 }}>
        <span className={claseNivel(nivel)}>{etiquetaNivel(nivel)}</span>
        <span className="badge">{Math.round(puntaje)} pts</span>
        {yaPostulado ? (
          <span className="badge" style={{ opacity: 0.8 }}>
            Ya postulaste
          </span>
        ) : null}
      </div>
      <div>
        <h3 className="empleo-card__title">
          <Link to={`/empleos/${empleo.id}`}>{empleo.title}</Link>
        </h3>
        {empleo.company ? (
          <p className="empleo-card__company">{empleo.company}</p>
        ) : null}
      </div>
      <ul className="detail-meta-list" style={{ flexDirection: "column", gap: 4 }}>
        {razones.slice(0, 3).map((r) => (
          <li key={r} style={{ listStyle: "disc", marginLeft: 18 }}>
            {r}
          </li>
        ))}
      </ul>
      <details style={{ fontSize: 13, color: "var(--color-text-muted, #64748b)" }}>
        <summary>Ver desglose del puntaje</summary>
        <dl style={{ marginTop: 8 }}>
          <dt>Habilidades</dt>
          <dd>{desglose.habilidades.toFixed(1)} / 35</dd>
          <dt>Carrera</dt>
          <dd>{desglose.carrera.toFixed(1)} / 25</dd>
          <dt>Intereses</dt>
          <dd>{desglose.intereses.toFixed(1)} / 15</dd>
          <dt>Modalidad</dt>
          <dd>{desglose.modalidad.toFixed(1)} / 10</dd>
          <dt>Ubicación</dt>
          <dd>{desglose.ubicacion.toFixed(1)} / 10</dd>
          <dt>Experiencia</dt>
          <dd>{desglose.experiencia.toFixed(1)} / 5</dd>
        </dl>
      </details>
      <div className="empleo-card__meta">
        {empleo.modalidad ? (
          <span className="badge badge--modalidad">{empleo.modalidad}</span>
        ) : null}
        {empleo.location ? <span>{empleo.location}</span> : null}
      </div>
      <div className="empleo-card__footer">
        <span className="empleo-card__source">
          Fuente: {empleo.fuenteNombre ?? "—"}
        </span>
        <Link to={`/empleos/${empleo.id}`} className="btn btn--primary">
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
