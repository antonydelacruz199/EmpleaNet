import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import { fetchRecomendaciones, recalcularRecomendaciones } from "./api";
import { RecomendacionCard } from "./RecomendacionCard";
import type { NivelCoincidencia, Recomendacion } from "./tipos";

const FILTROS_NIVEL: { value: NivelCoincidencia | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "alta", label: "Alta coincidencia" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

export function RecomendacionesPage() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [filtroNivel, setFiltroNivel] = useState<NivelCoincidencia | "">("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [recalculando, setRecalculando] = useState(false);

  async function cargar(nivel?: NivelCoincidencia) {
    setCargando(true);
    setError(null);
    try {
      const data = await fetchRecomendaciones(30, nivel);
      setRecomendaciones(data.recomendaciones);
      setPerfilIncompleto(Boolean(data.perfilIncompleto));
    } catch {
      setError("No se pudieron cargar las recomendaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar(filtroNivel || undefined);
  }, [filtroNivel]);

  async function handleRecalcular() {
    setRecalculando(true);
    setMensaje(null);
    try {
      const result = await recalcularRecomendaciones();
      setMensaje(result.mensaje);
      await cargar(filtroNivel || undefined);
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "No se pudo recalcular.");
    } finally {
      setRecalculando(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Recomendaciones personalizadas</h1>
        <p>
          Oportunidades ordenadas por afinidad con tu perfil (O3). Ponderación:
          habilidades 35%, carrera 25%, intereses 15%, modalidad 10%, ubicación
          10%, experiencia 5%.
        </p>
      </header>

      <div className="section-heading">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/perfil" className="btn btn--secondary">
            Mi perfil y preferencias
          </Link>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={recalculando}
            onClick={() => void handleRecalcular()}
          >
            {recalculando ? "Recalculando..." : "Recalcular ahora"}
          </button>
        </div>
      </div>

      <div className="chip-group" role="group" aria-label="Filtrar por nivel" style={{ marginBottom: 16 }}>
        {FILTROS_NIVEL.map((f) => (
          <button
            key={f.label}
            type="button"
            className={`chip${filtroNivel === f.value ? " chip--active" : ""}`}
            onClick={() => setFiltroNivel(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {mensaje ? (
        <p className="detail-actions__msg" role="status">
          {mensaje}
        </p>
      ) : null}
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}
      {cargando ? <p className="loading">Calculando recomendaciones...</p> : null}

      {!cargando && !error && perfilIncompleto ? (
        <div className="card empty-state">
          <p>
            Completa tu perfil con al menos una habilidad y tus preferencias
            laborales para obtener recomendaciones personalizadas.
          </p>
          <Link to="/perfil" className="btn btn--primary">
            Completar perfil
          </Link>
        </div>
      ) : null}

      {!cargando && !error && !perfilIncompleto && recomendaciones.length === 0 ? (
        <div className="card empty-state">
          <p>
            No encontramos coincidencias suficientes (mínimo 40 pts) con los
            filtros actuales. Prueba ampliar tu perfil o recalcular.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void handleRecalcular()}
          >
            Recalcular recomendaciones
          </button>
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
