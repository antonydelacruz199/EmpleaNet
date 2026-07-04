import { FormEvent, useEffect, useState } from "react";
import { fetchPerfil, updateHabilidades } from "./api";
import { CompletitudBar, PerfilNav } from "./PerfilNav";
import type { PerfilDetalle } from "./tipos";

export function PerfilHabilidadesPage() {
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPerfil()
      .then((p) => {
        setPerfil(p);
        setSkillsText(p.skills.join(", "));
      })
      .catch(() => setError("Error al cargar habilidades."));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const skills = skillsText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (skills.length === 0) {
      setError("Indica al menos una habilidad.");
      return;
    }
    try {
      const p = await updateHabilidades(skills);
      setPerfil(p);
      setSkillsText(p.skills.join(", "));
      setMensaje("Habilidades actualizadas.");
      setError(null);
    } catch {
      setError("No se pudieron guardar las habilidades.");
    }
  }

  if (!perfil && !error) return <p className="loading">Cargando...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Habilidades</h1>
        <p>Indica al menos 3 habilidades para maximizar tu completitud.</p>
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
      <form className="card form-card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="ph-skills">Habilidades (separadas por comas)</label>
          <input
            id="ph-skills"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="typescript, react, comunicación"
          />
        </div>
        <button type="submit" className="btn btn--primary">
          Guardar habilidades
        </button>
      </form>
    </>
  );
}
