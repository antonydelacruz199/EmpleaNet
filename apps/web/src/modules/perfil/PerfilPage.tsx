import { FormEvent, useEffect, useState } from "react";
import {
  fetchPreferenciasLaborales,
  updatePreferenciasLaborales,
} from "../recomendaciones/api";
import type { PreferenciasLaborales } from "../recomendaciones/tipos";
import { fetchPerfil, updatePerfil } from "./api";
import type { Perfil } from "./tipos";

export function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [carrera, setCarrera] = useState("");
  const [interesesText, setInteresesText] = useState("");
  const [anosExperiencia, setAnosExperiencia] = useState(0);
  const [modalidadPreferida, setModalidadPreferida] = useState<
    "" | "remoto" | "presencial" | "hibrido"
  >("");
  const [ubicacionPreferida, setUbicacionPreferida] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchPerfil(), fetchPreferenciasLaborales()])
      .then(([data, prefs]) => {
        if (!cancelled) {
          setPerfil(data);
          setName(data.name);
          setLocation(data.location ?? "");
          setSkillsText(data.skills.join(", "));
          aplicarPreferencias(prefs);
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

  function aplicarPreferencias(prefs: PreferenciasLaborales) {
    setCarrera(prefs.carrera ?? "");
    setInteresesText((prefs.intereses ?? []).join(", "));
    setAnosExperiencia(prefs.anosExperiencia ?? 0);
    setModalidadPreferida(prefs.modalidadPreferida ?? "");
    setUbicacionPreferida(prefs.ubicacionPreferida ?? "");
  }

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

      const intereses = interesesText
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const prefs = await updatePreferenciasLaborales({
        carrera: carrera.trim() || undefined,
        intereses: intereses.length ? intereses : undefined,
        anosExperiencia,
        modalidadPreferida: modalidadPreferida || undefined,
        ubicacionPreferida: ubicacionPreferida.trim() || undefined,
      });
      aplicarPreferencias(prefs);
      setMensaje(
        "Perfil y preferencias guardados. Las recomendaciones se recalcularon.",
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

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Preferencias laborales (O3)</h2>
        <div className="admin-form__grid" style={{ marginBottom: 24 }}>
          <label>
            Carrera / afinidad académica
            <input
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              placeholder="Ingeniería de sistemas"
            />
          </label>
          <label>
            Años de experiencia
            <input
              type="number"
              min={0}
              max={50}
              value={anosExperiencia}
              onChange={(e) => setAnosExperiencia(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            Intereses laborales (coma)
            <input
              value={interesesText}
              onChange={(e) => setInteresesText(e.target.value)}
              placeholder="tecnologia, startups"
            />
          </label>
          <label>
            Modalidad preferida
            <select
              value={modalidadPreferida}
              onChange={(e) =>
                setModalidadPreferida(
                  e.target.value as "" | "remoto" | "presencial" | "hibrido",
                )
              }
            >
              <option value="">Sin preferencia</option>
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </label>
          <label>
            Ubicación preferida
            <input
              value={ubicacionPreferida}
              onChange={(e) => setUbicacionPreferida(e.target.value)}
              placeholder="Lima, Arequipa..."
            />
          </label>
        </div>

        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar perfil y preferencias"}
        </button>
      </form>
    </>
  );
}
