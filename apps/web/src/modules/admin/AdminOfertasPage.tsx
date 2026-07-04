import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import {
  createAdminEmpleo,
  fetchAdminEmpleos,
  setAdminEmpleoActivo,
  updateAdminEmpleo,
} from "./api";
import type { CreateEmpleoAdminInput, EmpleoAdmin } from "./tipos";

const formularioVacio: CreateEmpleoAdminInput = {
  title: "",
  company: "",
  location: "",
  modalidad: "remoto",
  descripcion: "",
  urlOferta: "",
  salario: "",
  fechaPublicacion: "",
};

function etiquetaModalidad(modalidad?: string) {
  if (!modalidad) return "—";
  const map: Record<string, string> = {
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
  };
  return map[modalidad] ?? modalidad;
}

export function AdminOfertasPage() {
  const [empleos, setEmpleos] = useState<EmpleoAdmin[]>([]);
  const [form, setForm] = useState<CreateEmpleoAdminInput>(formularioVacio);
  const [editId, setEditId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const data = await fetchAdminEmpleos();
      setEmpleos(data.empleos);
    } catch {
      setMensaje("No se pudieron cargar las ofertas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  function actualizarCampo<K extends keyof CreateEmpleoAdminInput>(
    key: K,
    value: CreateEmpleoAdminInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function iniciarEdicion(empleo: EmpleoAdmin) {
    setEditId(empleo.id);
    setForm({
      title: empleo.title,
      company: empleo.company,
      location: empleo.location ?? "",
      modalidad: (empleo.modalidad as CreateEmpleoAdminInput["modalidad"]) ?? "remoto",
      descripcion: empleo.descripcion ?? "",
      urlOferta: empleo.urlOferta ?? "",
      salario: empleo.salario ?? "",
      fechaPublicacion: empleo.fechaPublicacion ?? "",
    });
    setMensaje(null);
  }

  function cancelarEdicion() {
    setEditId(null);
    setForm(formularioVacio);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setGuardando(true);
    setMensaje(null);
    const payload = {
      ...form,
      location: form.location || undefined,
      descripcion: form.descripcion || undefined,
      urlOferta: form.urlOferta || undefined,
      salario: form.salario || undefined,
      fechaPublicacion: form.fechaPublicacion || undefined,
    };
    try {
      if (editId) {
        await updateAdminEmpleo(editId, payload);
        setMensaje("Oferta actualizada.");
      } else {
        await createAdminEmpleo(payload);
        setMensaje("Oferta institucional registrada.");
      }
      cancelarEdicion();
      await cargar();
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "No se pudo guardar la oferta.");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(empleo: EmpleoAdmin) {
    setGuardando(true);
    setMensaje(null);
    try {
      await setAdminEmpleoActivo(empleo.id, !empleo.activo);
      await cargar();
      setMensaje(empleo.activo ? "Oferta archivada." : "Oferta reactivada.");
    } catch {
      setMensaje("No se pudo cambiar el estado de la oferta.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Gestión de ofertas</h1>
        <p>
          Registro manual de oportunidades institucionales (Bizagi O2). Las ofertas
          archivadas dejan de mostrarse en el marketplace.
        </p>
      </header>

      <section className="card detail-main admin-form-card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>
          {editId ? "Editar oferta" : "Nueva oferta institucional"}
        </h2>
        <form className="admin-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="admin-form__grid">
            <label>
              Título *
              <input
                required
                value={form.title}
                onChange={(e) => actualizarCampo("title", e.target.value)}
              />
            </label>
            <label>
              Empresa *
              <input
                required
                value={form.company}
                onChange={(e) => actualizarCampo("company", e.target.value)}
              />
            </label>
            <label>
              Ubicación
              <input
                value={form.location}
                onChange={(e) => actualizarCampo("location", e.target.value)}
              />
            </label>
            <label>
              Modalidad
              <select
                value={form.modalidad}
                onChange={(e) =>
                  actualizarCampo(
                    "modalidad",
                    e.target.value as CreateEmpleoAdminInput["modalidad"],
                  )
                }
              >
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </label>
            <label>
              Salario
              <input
                value={form.salario}
                onChange={(e) => actualizarCampo("salario", e.target.value)}
              />
            </label>
            <label>
              Fecha publicación
              <input
                value={form.fechaPublicacion}
                onChange={(e) => actualizarCampo("fechaPublicacion", e.target.value)}
              />
            </label>
          </div>
          <label>
            URL de la oferta
            <input
              type="url"
              value={form.urlOferta}
              onChange={(e) => actualizarCampo("urlOferta", e.target.value)}
            />
          </label>
          <label>
            Descripción
            <textarea
              rows={4}
              value={form.descripcion}
              onChange={(e) => actualizarCampo("descripcion", e.target.value)}
            />
          </label>
          <div className="modal__actions">
            {editId ? (
              <button type="button" className="btn btn--secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            ) : null}
            <button type="submit" className="btn btn--primary" disabled={guardando}>
              {guardando ? "Guardando..." : editId ? "Actualizar" : "Publicar oferta"}
            </button>
          </div>
        </form>
        {mensaje ? (
          <p className="detail-actions__msg" role="status">
            {mensaje}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="section-heading">
          <h2>Ofertas registradas</h2>
          <Link to="/admin/reportes">Ver reportes →</Link>
        </div>

        {cargando ? (
          <p className="loading">Cargando ofertas...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Empresa</th>
                  <th>Fuente</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleos.map((empleo) => (
                  <tr key={empleo.id}>
                    <td>
                      <Link to={`/empleos/${empleo.id}`} className="data-table__link">
                        {empleo.title}
                      </Link>
                    </td>
                    <td>{empleo.company}</td>
                    <td>{empleo.fuenteNombre ?? "—"}</td>
                    <td>{etiquetaModalidad(empleo.modalidad)}</td>
                    <td>
                      <span
                        className={
                          empleo.activo
                            ? "estado-badge estado-badge--registrada"
                            : "estado-badge estado-badge--cerrada"
                        }
                      >
                        {empleo.activo ? "Activa" : "Archivada"}
                      </span>
                    </td>
                    <td>
                      <div className="empleo-card__actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          disabled={guardando}
                          onClick={() => iniciarEdicion(empleo)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          disabled={guardando}
                          onClick={() => void toggleActivo(empleo)}
                        >
                          {empleo.activo ? "Archivar" : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
