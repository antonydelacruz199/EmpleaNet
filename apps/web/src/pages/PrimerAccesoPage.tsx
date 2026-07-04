import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { isEmpresaRole } from "../core/auth/authApi";
import { fetchPerfil, updatePerfil } from "../modules/perfil/api";

export function PrimerAccesoPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchPerfil()
      .then((data) => {
        if (!cancelled) {
          setName(data.name);
          setLocation(data.location ?? "");
          setSkillsText(data.skills.join(", "));
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar tu perfil inicial.");
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
    setGuardando(true);

    const skills = skillsText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (skills.length === 0) {
      setError("Indica al menos una habilidad o área de interés.");
      setGuardando(false);
      return;
    }

    try {
      await updatePerfil({
        name: name.trim(),
        location: location.trim() || undefined,
        skills,
      });
      await refreshUser();
      navigate(user && isEmpresaRole(user.rol) ? "/empleos" : "/", {
        replace: true,
      });
    } catch {
      setError("No se pudo guardar tu perfil.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="loading">Preparando tu primer acceso...</p>;

  const esEmpresa = user ? isEmpresaRole(user.rol) : false;

  return (
    <>
      <header className="page-header">
        <h1>Completa tu perfil</h1>
        <p>
          {esEmpresa
            ? "Antes de continuar, completa la información de tu organización."
            : "Es tu primer acceso. Completa tu perfil para activar recomendaciones personalizadas."}
        </p>
      </header>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      <form className="card form-card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="pa-name">
            {esEmpresa ? "Nombre de la empresa" : "Nombre completo"}
          </label>
          <input
            id="pa-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pa-location">Ubicación</label>
          <input
            id="pa-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={esEmpresa ? "Ciudad / país" : "Ej. Lima, Remoto"}
          />
        </div>
        <div className="field">
          <label htmlFor="pa-skills">
            {esEmpresa ? "Áreas o tecnologías de interés" : "Habilidades"}
          </label>
          <input
            id="pa-skills"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="typescript, react, reclutamiento"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Continuar a la plataforma"}
        </button>
      </form>
    </>
  );
}
