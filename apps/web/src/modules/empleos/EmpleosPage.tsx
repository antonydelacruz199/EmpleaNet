import { useEffect, useState } from "react";
import { fetchEmpleos } from "./api";
import type { Empleo } from "./tipos";

export function EmpleosPage() {
  const [empleos, setEmpleos] = useState<Empleo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchEmpleos({});
        if (!cancelled) setEmpleos(data.empleos);
      } catch {
        if (!cancelled) setError("No se pudieron cargar los empleos.");
      } finally {
        if (!cancelled) setCargando(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (cargando) return <p>Cargando empleos...</p>;

  return (
    <section>
      <h1>Empleos</h1>
      {empleos.length === 0 ? (
        <p>No hay ofertas publicadas todavía.</p>
      ) : (
        <ul>
          {empleos.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong>
              {job.company ? ` — ${job.company}` : ""}
              {job.location ? ` (${job.location})` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
