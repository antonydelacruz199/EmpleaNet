import { Link } from "react-router-dom";
import type { Empleo } from "./tipos";

type Props = {
  empleo: Empleo;
};

function etiquetaModalidad(modalidad?: string) {
  if (!modalidad) return null;
  const map: Record<string, string> = {
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
  };
  return map[modalidad.toLowerCase()] ?? modalidad;
}

export function EmpleoCard({ empleo }: Props) {
  const modalidadLabel = etiquetaModalidad(empleo.modalidad);

  return (
    <Link to={`/empleos/${empleo.id}`} className="card card--hover empleo-card">
      <div>
        <h3 className="empleo-card__title">{empleo.title}</h3>
        {empleo.company ? (
          <p className="empleo-card__company">{empleo.company}</p>
        ) : null}
      </div>
      <div className="empleo-card__meta">
        {modalidadLabel ? (
          <span className="badge badge--modalidad">{modalidadLabel}</span>
        ) : null}
        {empleo.location ? <span>{empleo.location}</span> : null}
        {empleo.fechaPublicacion ? (
          <span>Publicado: {empleo.fechaPublicacion}</span>
        ) : null}
        {empleo.salario ? <span>{empleo.salario}</span> : null}
      </div>
      <div className="empleo-card__footer">
        <span className="empleo-card__source">
          Fuente: {empleo.fuenteNombre ?? "—"}
        </span>
        <span className="btn btn--primary">Ver detalle</span>
      </div>
    </Link>
  );
}
