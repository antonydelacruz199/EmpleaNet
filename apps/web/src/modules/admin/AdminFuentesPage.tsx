import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import { createAdminFuente, fetchAdminFuentes, updateAdminFuente } from "./api";
import type { CreateFuenteInput, FuenteAdmin } from "./tipos";

const formVacio: CreateFuenteInput = {
  nombre: "",
  tipo: "institucional",
  url: "",
};

export function AdminFuentesPage() {
  const [fuentes, setFuentes] = useState<FuenteAdmin[]>([]);
  const [form, setForm] = useState<CreateFuenteInput>(formVacio);
  const [editId, setEditId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      setFuentes(await fetchAdminFuentes());
    } catch {
      setMensaje("No se pudieron cargar las fuentes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setGuardando(true);
    setMensaje(null);
    const payload = {
      nombre: form.nombre,
      tipo: form.tipo,
      url: form.url || undefined,
    };
    try {
      if (editId) {
        await updateAdminFuente(editId, payload);
        setMensaje("Fuente actualizada.");
      } else {
        await createAdminFuente(payload);
        setMensaje("Fuente registrada.");
      }
      setEditId(null);
      setForm(formVacio);
      await cargar();
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  function iniciarEdicion(fuente: FuenteAdmin) {
    setEditId(fuente.id);
    setForm({
      nombre: fuente.nombre,
      tipo: fuente.tipo as CreateFuenteInput["tipo"],
      url: fuente.url ?? "",
    });
  }

  return (
    <>
      <header className="page-header">
        <h1>Fuentes externas</h1>
        <p>
          Orígenes de ofertas (manual, API, institucional).{" "}
          <Link to="/admin/ofertas">← Volver a ofertas</Link>
        </p>
      </header>

      <section className="card detail-main admin-form-card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>
          {editId ? "Editar fuente" : "Nueva fuente"}
        </h2>
        <form className="admin-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="admin-form__grid">
            <label>
              Nombre *
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              />
            </label>
            <label>
              Tipo *
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    tipo: e.target.value as CreateFuenteInput["tipo"],
                  }))
                }
              >
                <option value="manual">Manual</option>
                <option value="api">API</option>
                <option value="institucional">Institucional</option>
                <option value="externa">Externa</option>
              </select>
            </label>
            <label>
              URL
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              />
            </label>
          </div>
          <div className="modal__actions">
            {editId ? (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setEditId(null);
                  setForm(formVacio);
                }}
              >
                Cancelar
              </button>
            ) : null}
            <button type="submit" className="btn btn--primary" disabled={guardando}>
              {guardando ? "Guardando..." : editId ? "Actualizar" : "Registrar"}
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
        {cargando ? (
          <p className="loading">Cargando fuentes...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>URL</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fuentes.map((fuente) => (
                  <tr key={fuente.id}>
                    <td>{fuente.nombre}</td>
                    <td>{fuente.tipo}</td>
                    <td>{fuente.url ?? "—"}</td>
                    <td>{fuente.activa ? "Activa" : "Inactiva"}</td>
                    <td>
                      <div className="empleo-card__actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => iniciarEdicion(fuente)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          disabled={guardando}
                          onClick={() =>
                            void updateAdminFuente(fuente.id, { activa: !fuente.activa }).then(
                              cargar,
                            )
                          }
                        >
                          {fuente.activa ? "Desactivar" : "Activar"}
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
