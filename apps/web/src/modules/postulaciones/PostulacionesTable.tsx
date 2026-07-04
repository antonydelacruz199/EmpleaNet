import { Link } from "react-router-dom";
import type { Postulacion } from "./tipos";
import {
  claseEstadoPostulacion,
  etiquetaEstadoPostulacion,
  formatearFecha,
} from "./utilidades";

type Props = {
  items: Postulacion[];
  compact?: boolean;
};

export function PostulacionesTable({ items, compact = false }: Props) {
  if (items.length === 0) {
    return (
      <div className="card empty-state">
        <p>Aún no tienes postulaciones registradas.</p>
        <Link to="/empleos" className="btn btn--primary">
          Explorar oportunidades
        </Link>
      </div>
    );
  }

  const visible = compact ? items.slice(0, 5) : items;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Oportunidad</th>
            <th>Empresa</th>
            <th>Fecha</th>
            <th>Estado</th>
            {!compact ? <th>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {visible.map((item) => (
            <tr key={item.id}>
              <td>
                <Link to={`/empleos/${item.empleoId}`} className="data-table__link">
                  {item.empleo?.title ?? `Oferta #${item.empleoId}`}
                </Link>
              </td>
              <td>{item.empleo?.company ?? "—"}</td>
              <td>{formatearFecha(item.fechaPostulacion)}</td>
              <td>
                <span className={claseEstadoPostulacion(item.estado)}>
                  {etiquetaEstadoPostulacion(item.estado)}
                </span>
              </td>
              {!compact ? (
                <td>
                  {item.empleo?.urlOferta ? (
                    <a
                      href={item.empleo.urlOferta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--secondary btn--sm"
                    >
                      Ver oferta
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {compact && items.length > 5 ? (
        <p className="table-footnote">
          <Link to="/postulaciones">Ver historial completo ({items.length}) →</Link>
        </p>
      ) : null}
    </div>
  );
}
