import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUsuarioPerfilAdmin } from "../perfil/api";
import { CompletitudBar } from "../perfil/PerfilNav";
import type { PerfilDetalle } from "../perfil/tipos";

export function AdminUsuarioDetallePage() {
  const { usuarioId } = useParams<{ usuarioId: string }>();
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuarioId) return;
    void fetchUsuarioPerfilAdmin(usuarioId)
      .then(setPerfil)
      .catch(() => setError("No se pudo cargar el perfil del usuario."));
  }, [usuarioId]);

  if (error) return <p className="alert">{error}</p>;
  if (!perfil) return <p className="loading">Cargando perfil...</p>;

  return (
    <>
      <header className="page-header">
        <Link to="/admin/usuarios" className="auth-link">
          ← Volver a usuarios
        </Link>
        <h1>{perfil.name}</h1>
        <p>
          {perfil.email} · {perfil.rol === "estudiante" ? "Estudiante" : "Egresado"}
        </p>
      </header>

      <CompletitudBar
        porcentaje={perfil.completitud.porcentaje}
        completo={perfil.completitud.completo}
      />

      <div className="perfil-grid">
        <section className="card perfil-section">
          <h2>Personal</h2>
          <dl className="perfil-dl">
            <dt>Teléfono</dt>
            <dd>{perfil.telefono ?? "—"}</dd>
            <dt>Ubicación</dt>
            <dd>{perfil.location ?? "—"}</dd>
            <dt>Resumen</dt>
            <dd>{perfil.resumen ?? "—"}</dd>
          </dl>
        </section>
        <section className="card perfil-section">
          <h2>Académico</h2>
          <dl className="perfil-dl">
            <dt>Carrera</dt>
            <dd>{perfil.carrera?.nombre ?? "—"}</dd>
            {perfil.rol === "estudiante" ? (
              <>
                <dt>Ciclo</dt>
                <dd>{perfil.cicloActual ?? "—"}</dd>
              </>
            ) : (
              <>
                <dt>Egreso</dt>
                <dd>{perfil.anioEgreso ?? "—"}</dd>
              </>
            )}
          </dl>
        </section>
        <section className="card perfil-section">
          <h2>Habilidades</h2>
          <div className="tag-list">
            {perfil.skills.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>
        </section>
        <section className="card perfil-section">
          <h2>Intereses</h2>
          <div className="tag-list">
            {perfil.intereses.map((i) => (
              <span key={i} className="tag tag--soft">
                {i}
              </span>
            ))}
          </div>
        </section>
        <section className="card perfil-section">
          <h2>Experiencia</h2>
          {perfil.experiencias.map((e) => (
            <p key={e.id}>
              <strong>{e.cargo}</strong> — {e.empresa}
            </p>
          ))}
        </section>
        <section className="card perfil-section">
          <h2>CV</h2>
          <p>{perfil.cv?.nombre ?? "Sin CV"}</p>
        </section>
      </div>
    </>
  );
}
