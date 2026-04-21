import { useEffect, useState } from "react";
import { fetchPerfil } from "./api";
import type { Perfil } from "./tipos";

export function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchPerfil();
        if (!cancelled) setPerfil(data);
      } catch {
        if (!cancelled) setError("No se pudo cargar el perfil.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (perfil === null) return <p>Cargando perfil...</p>;

  return (
    <section>
      <h1>Perfil</h1>
      <p>
        <strong>{perfil.name}</strong>
      </p>
      <p>Ubicación: {perfil.location ?? "Sin definir"}</p>
      <p>Habilidades: {perfil.skills.join(", ")}</p>
    </section>
  );
}
