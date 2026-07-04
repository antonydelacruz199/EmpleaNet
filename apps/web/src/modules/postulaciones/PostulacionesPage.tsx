import { useEffect, useState } from "react";
import { fetchPostulaciones } from "./api";
import { PostulacionesTable } from "./PostulacionesTable";
import type { Postulacion } from "./tipos";

export function PostulacionesPage() {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPostulaciones()
      .then((data) => {
        if (!cancelled) setItems(data.postulaciones);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el historial de postulaciones.");
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
        <h1>Mis postulaciones</h1>
        <p>
          Historial de oportunidades a las que has manifestado interés. El registro es
          interno; la postulación formal se realiza en el portal externo de la oferta.
        </p>
      </header>

      {cargando ? (
        <p className="loading">Cargando historial...</p>
      ) : error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : (
        <PostulacionesTable items={items} />
      )}
    </>
  );
}
