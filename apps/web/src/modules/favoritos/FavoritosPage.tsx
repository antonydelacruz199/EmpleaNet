import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFavoritos, quitarFavorito } from "./api";
import type { Favorito } from "./tipos";
import { formatearFecha } from "../postulaciones/utilidades";

export function FavoritosPage() {
  const [items, setItems] = useState<Favorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quitandoId, setQuitandoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchFavoritos()
      .then((data) => {
        if (!cancelled) setItems(data.favoritos);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar tus favoritos.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleQuitar(empleoId: string) {
    setQuitandoId(empleoId);
    try {
      await quitarFavorito(empleoId);
      setItems((prev) => prev.filter((f) => f.empleoId !== empleoId));
    } catch {
      setError("No se pudo quitar el favorito.");
    } finally {
      setQuitandoId(null);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Mis favoritos</h1>
        <p>Oportunidades que guardaste para revisar más tarde.</p>
      </header>

      {cargando ? (
        <p className="loading">Cargando favoritos...</p>
      ) : error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <p>No tienes ofertas guardadas.</p>
          <Link to="/empleos" className="btn btn--primary">
            Explorar oportunidades
          </Link>
        </div>
      ) : (
        <div className="empleos-list">
          {items.map((item) => (
            <article key={item.id} className="card empleo-card">
              <div className="empleo-card__body">
                <h2 className="empleo-card__title">
                  <Link to={`/empleos/${item.empleoId}`}>{item.empleo.title}</Link>
                </h2>
                <p className="empleo-card__company">{item.empleo.company}</p>
                <p className="empleo-card__source">
                  Guardado el {formatearFecha(item.creadoEn)}
                  {item.empleo.fuenteNombre ? ` · ${item.empleo.fuenteNombre}` : ""}
                </p>
              </div>
              <div className="empleo-card__actions">
                <Link to={`/empleos/${item.empleoId}`} className="btn btn--secondary btn--sm">
                  Ver detalle
                </Link>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={quitandoId === item.empleoId}
                  onClick={() => void handleQuitar(item.empleoId)}
                >
                  {quitandoId === item.empleoId ? "Quitando..." : "Quitar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
