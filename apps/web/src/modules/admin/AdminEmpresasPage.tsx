import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import { createAdminEmpresa, fetchAdminEmpresas, updateAdminEmpresa } from "./api";
import type { CreateEmpresaInput, EmpresaAdmin } from "./tipos";

const formVacio: CreateEmpresaInput = {
  nombre: "",
  sector: "",
  contactoEmail: "",
};

export function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [form, setForm] = useState<CreateEmpresaInput>(formVacio);
  const [editId, setEditId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      setEmpresas(await fetchAdminEmpresas());
    } catch {
      setMensaje("No se pudieron cargar las empresas.");
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
      sector: form.sector || undefined,
      contactoEmail: form.contactoEmail || undefined,
    };
    try {
      if (editId) {
        await updateAdminEmpresa(editId, payload);
        setMensaje("Empresa actualizada.");
      } else {
        await createAdminEmpresa(payload);
        setMensaje("Empresa registrada.");
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

  function iniciarEdicion(empresa: EmpresaAdmin) {
    setEditId(empresa.id);
    setForm({
      nombre: empresa.nombre,
      sector: empresa.sector ?? "",
      contactoEmail: empresa.contactoEmail ?? "",
    });
  }

  return (
    <>
      <header className="page-header">
        <h1>Empresas</h1>
        <p>
          Catálogo de empresas asociadas a ofertas.{" "}
          <Link to="/admin/ofertas">← Volver a ofertas</Link>
        </p>
      </header>

      <section className="card detail-main admin-form-card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>
          {editId ? "Editar empresa" : "Nueva empresa"}
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
              Sector
              <input
                value={form.sector}
                onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
              />
            </label>
            <label>
              Email contacto
              <input
                type="email"
                value={form.contactoEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactoEmail: e.target.value }))}
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
          <p className="loading">Cargando empresas...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Sector</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.nombre}</td>
                    <td>{empresa.sector ?? "—"}</td>
                    <td>{empresa.contactoEmail ?? "—"}</td>
                    <td>{empresa.activa ? "Activa" : "Inactiva"}</td>
                    <td>
                      <div className="empleo-card__actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => iniciarEdicion(empresa)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          disabled={guardando}
                          onClick={() =>
                            void updateAdminEmpresa(empresa.id, { activa: !empresa.activa }).then(
                              cargar,
                            )
                          }
                        >
                          {empresa.activa ? "Desactivar" : "Activar"}
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
