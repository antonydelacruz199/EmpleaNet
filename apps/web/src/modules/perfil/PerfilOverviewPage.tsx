import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPerfil } from "./api";
import { CompletitudBar, PerfilNav } from "./PerfilNav";
import type { PerfilDetalle } from "./tipos";

export function PerfilOverviewPage() {
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPerfil()
      .then(setPerfil)
      .catch(() => setError("No se pudo cargar el perfil."));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!perfil) return <p className="loading">Cargando perfil...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Mi perfil</h1>
        <p>
          {perfil.rol === "estudiante"
            ? "Perfil académico-profesional de estudiante UC."
            : "Perfil profesional de egresado UC."}
        </p>
      </header>

      <PerfilNav />
      <CompletitudBar
        porcentaje={perfil.completitud.porcentaje}
        completo={perfil.completitud.completo}
      />

      <div className="perfil-grid">
        <section className="card perfil-section">
          <h2>Datos personales</h2>
          <dl className="perfil-dl">
            <dt>Nombre</dt>
            <dd>{perfil.name}</dd>
            <dt>Correo</dt>
            <dd>{perfil.email}</dd>
            <dt>Teléfono</dt>
            <dd>{perfil.telefono ?? "—"}</dd>
            <dt>Ubicación</dt>
            <dd>{perfil.location ?? "—"}</dd>
          </dl>
          <Link to="/perfil/editar" className="btn btn--secondary btn--sm">
            Editar
          </Link>
        </section>

        <section className="card perfil-section">
          <h2>Perfil académico</h2>
          <dl className="perfil-dl">
            <dt>Carrera</dt>
            <dd>{perfil.carrera?.nombre ?? "—"}</dd>
            {perfil.rol === "estudiante" ? (
              <>
                <dt>Ciclo actual</dt>
                <dd>{perfil.cicloActual ?? "—"}</dd>
              </>
            ) : (
              <>
                <dt>Año de egreso</dt>
                <dd>{perfil.anioEgreso ?? "—"}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="card perfil-section">
          <h2>Habilidades ({perfil.skills.length})</h2>
          <div className="tag-list">
            {perfil.skills.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>
          <Link to="/perfil/habilidades" className="btn btn--secondary btn--sm">
            Gestionar
          </Link>
        </section>

        <section className="card perfil-section">
          <h2>Intereses ({perfil.intereses.length})</h2>
          <div className="tag-list">
            {perfil.intereses.map((i) => (
              <span key={i} className="tag tag--soft">
                {i}
              </span>
            ))}
          </div>
          <Link to="/perfil/intereses" className="btn btn--secondary btn--sm">
            Gestionar
          </Link>
        </section>

        <section className="card perfil-section">
          <h2>Experiencia ({perfil.experiencias.length})</h2>
          {perfil.experiencias.slice(0, 2).map((e) => (
            <p key={e.id} className="perfil-exp-preview">
              <strong>{e.cargo}</strong> — {e.empresa}
            </p>
          ))}
          <Link to="/perfil/experiencia" className="btn btn--secondary btn--sm">
            Gestionar
          </Link>
        </section>

        <section className="card perfil-section">
          <h2>CV</h2>
          <p>{perfil.cv ? perfil.cv.nombre : "Sin CV cargado"}</p>
          <Link to="/perfil/cv" className="btn btn--secondary btn--sm">
            {perfil.cv ? "Actualizar CV" : "Subir CV"}
          </Link>
        </section>
      </div>

      {perfil.completitud.faltantes.length > 0 ? (
        <section className="card perfil-section">
          <h2>Pendientes</h2>
          <ul className="perfil-faltantes">
            {perfil.completitud.faltantes.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
