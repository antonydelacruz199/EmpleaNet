import { FormEvent, useEffect, useState } from "react";
import { addExperiencia, deleteExperiencia, fetchPerfil } from "./api";
import { CompletitudBar, PerfilNav } from "./PerfilNav";
import type { PerfilDetalle } from "./tipos";

export function PerfilExperienciaPage() {
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [actual, setActual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    void fetchPerfil()
      .then(setPerfil)
      .catch(() => setError("Error al cargar experiencia."));
  }

  useEffect(() => {
    reload();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const p = await addExperiencia({
        empresa: empresa.trim(),
        cargo: cargo.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaInicio,
        fechaFin: actual ? undefined : fechaFin || undefined,
        actual,
      });
      setPerfil(p);
      setEmpresa("");
      setCargo("");
      setDescripcion("");
      setFechaInicio("");
      setFechaFin("");
      setActual(false);
    } catch {
      setError("No se pudo agregar la experiencia.");
    }
  }

  async function onDelete(id: string) {
    try {
      const p = await deleteExperiencia(id);
      setPerfil(p);
    } catch {
      setError("No se pudo eliminar la experiencia.");
    }
  }

  if (!perfil && !error) return <p className="loading">Cargando...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Experiencia</h1>
        <p>Prácticas, proyectos o empleos previos.</p>
      </header>
      <PerfilNav />
      {perfil ? (
        <CompletitudBar
          porcentaje={perfil.completitud.porcentaje}
          completo={perfil.completitud.completo}
        />
      ) : null}
      {error ? <p className="alert">{error}</p> : null}

      <div className="card" style={{ marginBottom: 24 }}>
        <h2>Historial</h2>
        {perfil?.experiencias.length === 0 ? (
          <p>Sin experiencias registradas.</p>
        ) : (
          <ul className="exp-list">
            {perfil?.experiencias.map((e) => (
              <li key={e.id} className="exp-list__item">
                <div>
                  <strong>{e.cargo}</strong> — {e.empresa}
                  <br />
                  <small>
                    {e.fechaInicio}
                    {e.actual ? " — Actual" : e.fechaFin ? ` — ${e.fechaFin}` : ""}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => void onDelete(e.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="card form-card" onSubmit={onSubmit}>
        <h2>Agregar experiencia</h2>
        <div className="field">
          <label htmlFor="px-emp">Empresa</label>
          <input id="px-emp" value={empresa} onChange={(e) => setEmpresa(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="px-cargo">Cargo</label>
          <input id="px-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="px-desc">Descripción</label>
          <textarea id="px-desc" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="px-ini">Inicio</label>
            <input id="px-ini" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="px-fin">Fin</label>
            <input id="px-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={actual} />
          </div>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={actual} onChange={(e) => setActual(e.target.checked)} />
          Trabajo actual
        </label>
        <button type="submit" className="btn btn--primary">
          Agregar
        </button>
      </form>
    </>
  );
}
