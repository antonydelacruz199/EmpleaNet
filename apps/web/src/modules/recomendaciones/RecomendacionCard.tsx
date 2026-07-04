import { Link } from "react-router-dom";
import type { Recomendacion } from "./tipos";

type Props = {
  item: Recomendacion;
};

export function RecomendacionCard({ item }: Props) {
  const { empleo, puntaje, motivo } = item;

  return (
    <article className="card card--hover empleo-card">
      <div className="empleo-card__footer" style={{ border: "none", paddingTop: 0 }}>
        <span className="badge">{Math.round(puntaje)}% afinidad</span>
      </div>
      <div>
        <h3 className="empleo-card__title">
          <Link to={`/empleos/${empleo.id}`}>{empleo.title}</Link>
        </h3>
        {empleo.company ? (
          <p className="empleo-card__company">{empleo.company}</p>
        ) : null}
      </div>
      <p className="empleo-card__meta" style={{ fontStyle: "normal" }}>
        {motivo}
      </p>
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
