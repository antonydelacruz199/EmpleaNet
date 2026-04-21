import { useEffect, useState } from "react";
import type { Empleo } from "../empleos/tipos";
import { fetchRecomendaciones } from "./api";

export function RecomendacionesPage() {
  const [recomendaciones, setRecomendaciones] = useState<Empleo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchRecomendaciones({ skills: "typescript,react" });
        if (!cancelled) setRecomendaciones(data);
      } catch {
        if (!cancelled) setError("No se pudieron cargar las recomendaciones.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <section>
      <h1>Recomendaciones</h1>
      <p>Coincidencias de empleo según tu perfil y habilidades.</p>
      {recomendaciones.length === 0 ? (
        <p>No hay coincidencias con el perfil actual.</p>
      ) : (
        <ul>
          {recomendaciones.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong>
              {job.company ? ` — ${job.company}` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
