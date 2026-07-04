import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { isStudentRole } from "../core/auth/authApi";
import { fetchPerfil } from "../modules/perfil/api";
import type { Perfil } from "../modules/perfil/tipos";
import { fetchRecomendaciones } from "../modules/recomendaciones/api";
import { RecomendacionCard } from "../modules/recomendaciones/RecomendacionCard";
import type { Recomendacion } from "../modules/recomendaciones/tipos";

export function InicioPage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const esEstudiante = user ? isStudentRole(user.rol) : false;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    if (!esEstudiante) {
      setCargando(false);
      return;
    }

    void Promise.all([fetchPerfil(), fetchRecomendaciones(5)])
      .then(([perfilData, recData]) => {
        if (!cancelled) {
          setPerfil(perfilData);
          setRecomendaciones(recData.recomendaciones);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPerfil(null);
          setRecomendaciones([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, esEstudiante]);

  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>
          Bienvenido, {user?.name}. Plataforma Continental Oportunidades — Universidad
          Continental.
        </p>
      </header>

      {!esEstudiante ? (
        <section className="card detail-main">
          <h2 style={{ marginTop: 0, color: "var(--co-primary)" }}>
            Panel {user?.rol === "administrador" ? "administrativo" : "de soporte"}
          </h2>
          <p>
            Desde aquí puedes consultar las oportunidades centralizadas. Las funciones
            de gestión avanzada se habilitarán en fases posteriores del roadmap.
          </p>
          <Link to="/empleos" className="btn btn--primary">
            Ver oportunidades
          </Link>
        </section>
      ) : (
        <>
          <div className="detail-grid">
            <section className="card detail-main">
              <h2 style={{ marginTop: 0, fontSize: 20, color: "var(--co-primary)" }}>
                Tu perfil
              </h2>
              {cargando ? (
                <p className="loading">Cargando...</p>
              ) : perfil ? (
                <>
                  <p>
                    <strong>{perfil.name}</strong>
                  </p>
                  <p style={{ color: "var(--co-on-surface-variant)" }}>
                    {perfil.email}
                  </p>
                  <p>Ubicación: {perfil.location ?? "Sin definir"}</p>
                  <p>Habilidades: {perfil.skills.join(", ")}</p>
                  <Link to="/perfil" className="btn btn--secondary">
                    Editar perfil
                  </Link>
                </>
              ) : (
                <p>No se pudo cargar el perfil.</p>
              )}
            </section>

            <aside className="card detail-sidebar">
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Accesos rápidos</h2>
              <Link to="/empleos" className="btn btn--primary">
                Marketplace de oportunidades
              </Link>
              <Link to="/recomendados" className="btn btn--secondary">
                Ver todas las recomendaciones
              </Link>
            </aside>
          </div>

          <section style={{ marginTop: 32 }}>
            <div className="section-heading">
              <h2>Top recomendaciones</h2>
              <Link to="/recomendados">Ver todas →</Link>
            </div>

            {cargando ? (
              <p className="loading">Calculando recomendaciones...</p>
            ) : recomendaciones.length === 0 ? (
              <div className="card empty-state">
                <p>
                  Completa tu perfil para recibir recomendaciones personalizadas.
                </p>
              </div>
            ) : (
              <div className="empleos-list">
                {recomendaciones.map((item) => (
                  <RecomendacionCard key={item.empleo.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
