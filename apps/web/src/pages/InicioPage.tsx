import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { isAdminRole, isStudentRole } from "../core/auth/authApi";
import { fetchReportesResumen } from "../modules/admin/api";
import type { ReportesResumen } from "../modules/admin/tipos";
import { fetchFavoritos } from "../modules/favoritos/api";
import { fetchPerfil } from "../modules/perfil/api";
import type { Perfil } from "../modules/perfil/tipos";
import { fetchPostulaciones, fetchPostulacionesResumen } from "../modules/postulaciones/api";
import { PostulacionesTable } from "../modules/postulaciones/PostulacionesTable";
import type { Postulacion } from "../modules/postulaciones/tipos";
import { fetchRecomendaciones } from "../modules/recomendaciones/api";
import { RecomendacionCard } from "../modules/recomendaciones/RecomendacionCard";
import type { Recomendacion } from "../modules/recomendaciones/tipos";

export function InicioPage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [postulacionesActivas, setPostulacionesActivas] = useState(0);
  const [favoritosTotal, setFavoritosTotal] = useState(0);
  const [cargando, setCargando] = useState(true);

  const esEstudiante = user ? isStudentRole(user.rol) : false;
  const esAdmin = user ? isAdminRole(user.rol) : false;
  const [reportes, setReportes] = useState<ReportesResumen | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    if (esAdmin) {
      void fetchReportesResumen()
        .then((data) => {
          if (!cancelled) setReportes(data);
        })
        .catch(() => {
          if (!cancelled) setReportes(null);
        })
        .finally(() => {
          if (!cancelled) setCargando(false);
        });
      return () => {
        cancelled = true;
      };
    }

    if (!esEstudiante) {
      setCargando(false);
      return;
    }

    void Promise.all([
      fetchPerfil(),
      fetchRecomendaciones(5),
      fetchPostulaciones(),
      fetchPostulacionesResumen(),
      fetchFavoritos(),
    ])
      .then(([perfilData, recData, postData, resumen, favData]) => {
        if (!cancelled) {
          setPerfil(perfilData);
          setRecomendaciones(recData.recomendaciones);
          setPostulaciones(postData.postulaciones);
          setPostulacionesActivas(resumen.activas);
          setFavoritosTotal(favData.total);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPerfil(null);
          setRecomendaciones([]);
          setPostulaciones([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, esEstudiante, esAdmin]);

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
        esAdmin ? (
          <>
            <div className="stats-grid">
              <div className="stat-card card">
                <span className="stat-card__label">Usuarios activos</span>
                <strong className="stat-card__value">
                  {cargando ? "—" : (reportes?.usuariosActivos ?? 0)}
                </strong>
              </div>
              <div className="stat-card card">
                <span className="stat-card__label">Ofertas publicadas</span>
                <strong className="stat-card__value">
                  {cargando ? "—" : (reportes?.ofertasPublicadas ?? 0)}
                </strong>
              </div>
              <div className="stat-card card">
                <span className="stat-card__label">Postulaciones</span>
                <strong className="stat-card__value">
                  {cargando ? "—" : (reportes?.postulacionesRegistradas ?? 0)}
                </strong>
              </div>
            </div>
            <section className="card detail-main">
              <h2 style={{ marginTop: 0, color: "var(--co-primary)" }}>
                Panel administrativo
              </h2>
              <p>
                Gestiona ofertas institucionales y consulta indicadores de uso de la
                plataforma.
              </p>
              <div className="empleo-card__actions">
                <Link to="/admin/ofertas" className="btn btn--primary">
                  Gestión de ofertas
                </Link>
              <Link to="/admin/reportes" className="btn btn--secondary">
                Reportes institucionales
              </Link>
              <Link to="/admin/estrategico" className="btn btn--secondary">
                Panel estratégico
              </Link>
                <Link to="/empleos" className="btn btn--secondary">
                  Ver marketplace
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section className="card detail-main">
            <h2 style={{ marginTop: 0, color: "var(--co-primary)" }}>
              Panel de soporte técnico
            </h2>
            <p>
              Configura el motor de recomendación, registra incidencias y consulta la
              auditoría del sistema.
            </p>
            <div className="empleo-card__actions">
              <Link to="/soporte/motor" className="btn btn--primary">
                Configuración del motor
              </Link>
              <Link to="/soporte/incidencias" className="btn btn--secondary">
                Incidencias y auditoría
              </Link>
              <Link to="/empleos" className="btn btn--secondary">
                Ver oportunidades
              </Link>
            </div>
          </section>
        )
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card card">
              <span className="stat-card__label">Postulaciones activas</span>
              <strong className="stat-card__value">
                {cargando ? "—" : postulacionesActivas}
              </strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Favoritos guardados</span>
              <strong className="stat-card__value">
                {cargando ? "—" : favoritosTotal}
              </strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Recomendaciones</span>
              <strong className="stat-card__value">
                {cargando ? "—" : recomendaciones.length}
              </strong>
            </div>
          </div>

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
              <Link to="/postulaciones" className="btn btn--secondary">
                Mis postulaciones
              </Link>
              <Link to="/favoritos" className="btn btn--secondary">
                Mis favoritos
              </Link>
            </aside>
          </div>

          <section style={{ marginTop: 32 }}>
            <div className="section-heading">
              <h2>Historial reciente de postulaciones</h2>
              <Link to="/postulaciones">Ver historial →</Link>
            </div>

            {cargando ? (
              <p className="loading">Cargando postulaciones...</p>
            ) : (
              <PostulacionesTable items={postulaciones} compact />
            )}
          </section>

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
