import { FormEvent, useEffect, useState } from "react";
import { fetchPerfil, updateIntereses } from "./api";
import { CompletitudBar, PerfilNav } from "./PerfilNav";
import type { PerfilDetalle } from "./tipos";

const SUGERIDOS = [
  "Desarrollo web",
  "Data analytics",
  "UX/UI",
  "Remoto",
  "Startups",
  "Consultoría",
];

export function PerfilInteresesPage() {
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [interesesText, setInteresesText] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPerfil()
      .then((p) => {
        setPerfil(p);
        setInteresesText(p.intereses.join(", "));
      })
      .catch(() => setError("Error al cargar intereses."));
  }, []);

  function addSugerido(item: string) {
    const actuales = interesesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!actuales.includes(item)) {
      setInteresesText([...actuales, item].join(", "));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const intereses = interesesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (intereses.length === 0) {
      setError("Indica al menos un interés.");
      return;
    }
    try {
      const p = await updateIntereses(intereses);
      setPerfil(p);
      setInteresesText(p.intereses.join(", "));
      setMensaje("Intereses actualizados.");
      setError(null);
    } catch {
      setError("No se pudieron guardar los intereses.");
    }
  }

  if (!perfil && !error) return <p className="loading">Cargando...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Intereses laborales</h1>
        <p>Define tus áreas de interés para orientar recomendaciones.</p>
      </header>
      <PerfilNav />
      {perfil ? (
        <CompletitudBar
          porcentaje={perfil.completitud.porcentaje}
          completo={perfil.completitud.completo}
        />
      ) : null}
      {error ? <p className="alert">{error}</p> : null}
      {mensaje ? <p className="alert alert--success">{mensaje}</p> : null}
      <div className="tag-list" style={{ marginBottom: 16 }}>
        {SUGERIDOS.map((s) => (
          <button
            key={s}
            type="button"
            className="tag tag--clickable"
            onClick={() => addSugerido(s)}
          >
            + {s}
          </button>
        ))}
      </div>
      <form className="card form-card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="pi-int">Intereses (separados por comas)</label>
          <input
            id="pi-int"
            value={interesesText}
            onChange={(e) => setInteresesText(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn--primary">
          Guardar intereses
        </button>
      </form>
    </>
  );
}
