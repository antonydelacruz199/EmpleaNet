import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { HttpError } from "../../core/http/clienteHttp";
import { isStudentRole } from "../../core/auth/authApi";
import {
  fetchFavoritoEstado,
  guardarFavorito,
  quitarFavorito,
} from "../favoritos/api";
import {
  crearPostulacion,
  fetchPostulacionEstado,
} from "../postulaciones/api";
import {
  claseEstadoPostulacion,
  etiquetaEstadoPostulacion,
} from "../postulaciones/utilidades";
import { fetchCoincidencia } from "../recomendaciones/api";
import { claseNivel, etiquetaNivel } from "../recomendaciones/tipos";
import type { CoincidenciaDetalle } from "../recomendaciones/tipos";
import { fetchEmpleoById } from "./api";
import type { EmpleoDetalle } from "./tipos";

function etiquetaModalidad(modalidad?: string) {
  if (!modalidad) return "—";
  const map: Record<string, string> = {
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
  };
  return map[modalidad.toLowerCase()] ?? modalidad;
}

export function EmpleoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const esEstudiante = user ? isStudentRole(user.rol) : false;

  const [empleo, setEmpleo] = useState<EmpleoDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const [esFavorito, setEsFavorito] = useState(false);
  const [postulado, setPostulado] = useState(false);
  const [estadoPostulacion, setEstadoPostulacion] = useState<
    "registrada" | "en_proceso" | "cerrada" | null
  >(null);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionCargando, setAccionCargando] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);
  const [coincidencia, setCoincidencia] = useState<CoincidenciaDetalle | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Identificador de oferta no válido.");
      setCargando(false);
      return;
    }
    let cancelled = false;

    const tareas: Promise<unknown>[] = [fetchEmpleoById(id)];

    if (esEstudiante) {
      tareas.push(
        fetchFavoritoEstado(id),
        fetchPostulacionEstado(id),
        fetchCoincidencia(id).catch(() => null),
      );
    }

    void Promise.all(tareas)
      .then((results) => {
        if (cancelled) return;
        const empleoData = results[0] as EmpleoDetalle;
        setEmpleo(empleoData);

        if (esEstudiante && results.length > 2) {
          const favoritoEstado = results[1] as { esFavorito: boolean };
          const postulacionEstado = results[2] as {
            postulado: boolean;
            postulacion?: { estado: "registrada" | "en_proceso" | "cerrada" };
          };
          setEsFavorito(favoritoEstado.esFavorito);
          setPostulado(postulacionEstado.postulado);
          setEstadoPostulacion(postulacionEstado.postulacion?.estado ?? null);
          if (results[3]) {
            setCoincidencia(results[3] as CoincidenciaDetalle);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se encontró la oportunidad solicitada.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, esEstudiante]);

  async function toggleFavorito() {
    if (!id || !esEstudiante) return;
    setAccionCargando(true);
    setMensajeAccion(null);
    try {
      if (esFavorito) {
        await quitarFavorito(id);
        setEsFavorito(false);
        setMensajeAccion("Oferta quitada de favoritos.");
      } else {
        await guardarFavorito(id);
        setEsFavorito(true);
        setMensajeAccion("Oferta guardada en favoritos.");
      }
    } catch (err) {
      const msg =
        err instanceof HttpError ? err.message : "No se pudo actualizar el favorito.";
      setMensajeAccion(msg);
    } finally {
      setAccionCargando(false);
    }
  }

  async function confirmarPostulacion() {
    if (!id || !empleo) return;
    setAccionCargando(true);
    setMensajeAccion(null);
    try {
      const result = await crearPostulacion(id);
      setPostulado(true);
      setEstadoPostulacion(result.postulacion.estado);
      setMostrarConfirmacion(false);
      setMensajeAccion("Postulación registrada correctamente.");

      const url = result.urlOferta ?? empleo.urlOferta;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      const msg =
        err instanceof HttpError
          ? err.message
          : "No se pudo registrar la postulación.";
      setMensajeAccion(msg);
      setMostrarConfirmacion(false);
    } finally {
      setAccionCargando(false);
    }
  }

  if (cargando) return <p className="loading">Cargando detalle...</p>;
  if (error) return <p className="alert" role="alert">{error}</p>;
  if (!empleo) return null;

  return (
    <>
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/empleos">Oportunidades</Link>
        <span className="breadcrumb__sep">›</span>
        <span className="breadcrumb__current">{empleo.title}</span>
      </nav>

      <div className="detail-grid">
        <article className="card detail-main">
          <h1>{empleo.title}</h1>
          {empleo.company ? (
            <p className="detail-main__company">{empleo.company}</p>
          ) : null}

          <div className="detail-meta-list">
            <span className="badge badge--modalidad">
              {etiquetaModalidad(empleo.modalidad)}
            </span>
            {empleo.location ? (
              <span className="badge badge--modalidad">{empleo.location}</span>
            ) : null}
          </div>

          {empleo.descripcion ? (
            <div className="detail-description">{empleo.descripcion}</div>
          ) : (
            <p className="detail-description">Sin descripción disponible.</p>
          )}
        </article>

        <aside className="card detail-sidebar">
          <dl>
            <dt>Fuente</dt>
            <dd>{empleo.fuenteNombre ?? "—"}</dd>

            <dt>Publicación</dt>
            <dd>{empleo.fechaPublicacion ?? "—"}</dd>

            <dt>Salario</dt>
            <dd>{empleo.salario ?? "No especificado"}</dd>
          </dl>

          {coincidencia ? (
            <div className="detail-actions" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Tu coincidencia</h3>
              <p>
                <span className={claseNivel(coincidencia.nivel)}>
                  {etiquetaNivel(coincidencia.nivel)}
                </span>{" "}
                <strong>{Math.round(coincidencia.puntaje)} pts</strong>
              </p>
              <ul style={{ margin: "8px 0", paddingLeft: 18 }}>
                {coincidencia.razones.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {esEstudiante ? (
            <div className="detail-actions">
              {postulado && estadoPostulacion ? (
                <p className="detail-actions__estado">
                  Postulación:{" "}
                  <span className={claseEstadoPostulacion(estadoPostulacion)}>
                    {etiquetaEstadoPostulacion(estadoPostulacion)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={accionCargando}
                  onClick={() => setMostrarConfirmacion(true)}
                >
                  Postular
                </button>
              )}

              <button
                type="button"
                className={`btn ${esFavorito ? "btn--secondary" : "btn--ghost"}`}
                disabled={accionCargando}
                onClick={() => void toggleFavorito()}
              >
                {esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
              </button>

              {mensajeAccion ? (
                <p className="detail-actions__msg" role="status">
                  {mensajeAccion}
                </p>
              ) : null}
            </div>
          ) : null}

          {empleo.urlOferta ? (
            <a
              href={empleo.urlOferta}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary"
            >
              Ver oferta original
            </a>
          ) : (
            <p className="empleo-card__source">Enlace original no disponible.</p>
          )}

          <Link to="/empleos" className="btn btn--secondary">
            Volver al marketplace
          </Link>
        </aside>
      </div>

      {mostrarConfirmacion ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-postulacion-title"
          >
            <h2 id="confirm-postulacion-title">Confirmar postulación</h2>
            <p>
              Se registrará tu intención de postulación para{" "}
              <strong>{empleo.title}</strong> en {empleo.company}. Luego podrás
              completar el proceso en el portal externo de la oferta.
            </p>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                disabled={accionCargando}
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={accionCargando}
                onClick={() => void confirmarPostulacion()}
              >
                {accionCargando ? "Registrando..." : "Confirmar y continuar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
