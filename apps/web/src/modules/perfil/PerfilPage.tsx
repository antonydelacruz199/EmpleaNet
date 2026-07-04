import { FormEvent, useEffect, useState } from "react";
import { fetchPerfil, updatePerfil } from "./api";
import type { Perfil } from "./tipos";

export function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchPerfil()
      .then((data) => {
        if (!cancelled) {
          setPerfil(data);
          setName(data.name);
          setLocation(data.location ?? "");
          setSkillsText(data.skills.join(", "));
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el perfil.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);

    const skills = skillsText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (skills.length === 0) {
      setError("Indica al menos una habilidad separada por comas.");
      setGuardando(false);
      return;
    }

    try {
      const actualizado = await updatePerfil({
        name: name.trim(),
        location: location.trim() || undefined,
        skills,
      });
      setPerfil(actualizado);
      setSkillsText(actualizado.skills.join(", "));
      setMensaje(
        "Perfil actualizado. Las recomendaciones se recalcularon automáticamente.",
      );
    } catch {
      setError("No se pudo guardar el perfil.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="loading">Cargando perfil...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Mi perfil académico-profesional</h1>
        <p>
          Completa tu perfil para que el motor de recomendación de Continental
          Oportunidades sugiera ofertas alineadas a tu formación.
        </p>
      </header>

      {error ? <p className="alert" role="alert">{error}</p> : null}
      {mensaje ? (
        <p
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            background: "var(--co-secondary-container)",
            border: "none",
          }}
          role="status"
        >
          {mensaje}
        </p>
      ) : null}

      <form className="card" style={{ padding: 24 }} onSubmit={onSubmit}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="perfil-email">Correo institucional</label>
          <input
            id="perfil-email"
            type="email"
            value={perfil?.email ?? ""}
            disabled
          />
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="perfil-name">Nombre completo</label>
          <input
            id="perfil-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="perfil-location">Ubicación o preferencia</label>
          <input
            id="perfil-location"
            type="text"
            placeholder="Ej. Remoto, Lima, Híbrido..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <label htmlFor="perfil-skills">Habilidades</label>
          <input
            id="perfil-skills"
            type="text"
            placeholder="typescript, react, nodejs"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            required
          />
          <small style={{ color: "var(--co-on-surface-variant)" }}>
            Separa cada habilidad con comas.
          </small>
        </div>

        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar perfil"}
        </button>
      </form>
    </>
  );
}
