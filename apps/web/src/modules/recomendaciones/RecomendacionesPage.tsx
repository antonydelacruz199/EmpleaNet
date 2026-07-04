import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecomendaciones } from "./api";
import { RecomendacionCard } from "./RecomendacionCard";
import type { Recomendacion } from "./tipos";

export function RecomendacionesPage() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchRecomendaciones(30)
      .then((data) => {
        if (!cancelled) setRecomendaciones(data.recomendaciones);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las recomendaciones.");
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
        <h1>Recomendaciones para ti</h1>
        <p>
          Oportunidades ordenadas por afinidad con tu perfil, calculadas por el
          motor de reglas de Continental Oportunidades.
        </p>
      </header>

      <p style={{ marginBottom: 16 }}>
        <Link to="/perfil" className="btn btn--secondary">
          Editar mi perfil
        </Link>
      </p>

      {error ? <p className="alert" role="alert">{error}</p> : null}
      {cargando ? <p className="loading">Calculando recomendaciones...</p> : null}

      {!cargando && !error && recomendaciones.length === 0 ? (
        <div className="card empty-state">
          <p>
            No hay recomendaciones aún. Completa tu perfil con habilidades para
            obtener sugerencias personalizadas.
          </p>
          <Link to="/perfil" className="btn btn--primary">
            Ir a mi perfil
          </Link>
        </div>
      ) : null}

      {!cargando && !error && recomendaciones.length > 0 ? (
        <div className="empleos-list">
          {recomendaciones.map((item) => (
            <RecomendacionCard key={item.empleo.id} item={item} />
          ))}
        </div>
      ) : null}
    </>
  );
}
