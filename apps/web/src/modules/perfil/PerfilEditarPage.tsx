import { FormEvent, useEffect, useState } from "react";
import { fetchCarreras, fetchPerfil, updatePerfil } from "./api";
import { CompletitudBar, PerfilNav } from "./PerfilNav";
import type { Carrera, PerfilDetalle } from "./tipos";

export function PerfilEditarPage() {
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [resumen, setResumen] = useState("");
  const [location, setLocation] = useState("");
  const [carreraId, setCarreraId] = useState("");
  const [cicloActual, setCicloActual] = useState("");
  const [anioEgreso, setAnioEgreso] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    void Promise.all([fetchPerfil(), fetchCarreras()])
      .then(([p, c]) => {
        setPerfil(p);
        setCarreras(c);
        setName(p.name);
        setTelefono(p.telefono ?? "");
        setResumen(p.resumen ?? "");
        setLocation(p.location ?? "");
        setCarreraId(p.carrera?.id ?? "");
        setCicloActual(p.cicloActual ? String(p.cicloActual) : "");
        setAnioEgreso(p.anioEgreso ? String(p.anioEgreso) : "");
      })
      .catch(() => setError("No se pudo cargar el perfil."));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const actualizado = await updatePerfil({
        name: name.trim(),
        telefono: telefono.trim() || undefined,
        resumen: resumen.trim() || undefined,
        location: location.trim() || undefined,
        carreraId: carreraId ? Number(carreraId) : undefined,
        cicloActual:
          perfil.rol === "estudiante" && cicloActual
            ? Number(cicloActual)
            : undefined,
        anioEgreso:
          perfil.rol === "egresado" && anioEgreso
            ? Number(anioEgreso)
            : undefined,
      });
      setPerfil(actualizado);
      setMensaje("Perfil actualizado correctamente.");
    } catch {
      setError("No se pudo guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  if (error && !perfil) return <p className="alert">{error}</p>;
  if (!perfil) return <p className="loading">Cargando...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Editar perfil</h1>
        <p>Actualiza tu información personal y académica.</p>
      </header>
      <PerfilNav />
      <CompletitudBar
        porcentaje={perfil.completitud.porcentaje}
        completo={perfil.completitud.completo}
      />
      {error ? <p className="alert">{error}</p> : null}
      {mensaje ? <p className="alert alert--success">{mensaje}</p> : null}

      <form className="card form-card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="pe-name">Nombre completo</label>
          <input id="pe-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="pe-tel">Teléfono</label>
          <input id="pe-tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pe-loc">Ubicación / preferencia</label>
          <input id="pe-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pe-res">Resumen profesional</label>
          <textarea
            id="pe-res"
            rows={4}
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            placeholder="Describe tu perfil en al menos 20 caracteres..."
          />
        </div>
        <div className="field">
          <label htmlFor="pe-carrera">Carrera</label>
          <select
            id="pe-carrera"
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        {perfil.rol === "estudiante" ? (
          <div className="field">
            <label htmlFor="pe-ciclo">Ciclo actual</label>
            <input
              id="pe-ciclo"
              type="number"
              min={1}
              max={12}
              value={cicloActual}
              onChange={(e) => setCicloActual(e.target.value)}
            />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="pe-egreso">Año de egreso</label>
            <input
              id="pe-egreso"
              type="number"
              min={1990}
              max={2100}
              value={anioEgreso}
              onChange={(e) => setAnioEgreso(e.target.value)}
            />
          </div>
        )}
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </>
  );
}
