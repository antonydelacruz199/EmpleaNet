import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import {
  cerrarAdminEmpleo,
  clasificarAdminEmpleo,
  createAdminEmpleo,
  fetchAdminEmpleos,
  fetchAdminEmpleosResumen,
  fetchAdminEmpresas,
  fetchAdminFuentes,
  publicarAdminEmpleo,
  rechazarAdminEmpleo,
  setAdminEmpleoActivo,
  updateAdminEmpleo,
  validarAdminEmpleo,
} from "./api";
import type {
  ClasificarOfertaInput,
  CreateEmpleoAdminInput,
  EmpleoAdmin,
  EmpresaAdmin,
  EstadoOferta,
  FuenteAdmin,
  ListOfertasFiltros,
  OfertasResumenAdmin,
} from "./tipos";

const formularioVacio: CreateEmpleoAdminInput = {
  title: "",
  company: "",
  fuenteId: 0,
  location: "",
  modalidad: "remoto",
  categoria: "tecnologia",
  tipoOportunidad: "empleo",
  descripcion: "",
  urlOferta: "",
  salario: "",
  fechaPublicacion: "",
  fechaCierre: "",
  habilidadesRequeridas: [],
};

const ESTADOS: { value: EstadoOferta | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "borrador", label: "Borrador" },
  { value: "pendiente_validacion", label: "Pendiente validación" },
  { value: "validada", label: "Validada" },
  { value: "publicada", label: "Publicada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "cerrada", label: "Cerrada" },
  { value: "archivada", label: "Archivada" },
];

function etiquetaEstado(estado: EstadoOferta) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado;
}

function claseEstado(estado: EstadoOferta) {
  if (estado === "publicada") return "estado-badge estado-badge--registrada";
  if (estado === "validada" || estado === "pendiente_validacion") {
    return "estado-badge estado-badge--proceso";
  }
  return "estado-badge estado-badge--cerrada";
}

function etiquetaModalidad(modalidad?: string) {
  const map: Record<string, string> = {
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
  };
  return modalidad ? (map[modalidad] ?? modalidad) : "—";
}

function fechaMinima() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminOfertasPage() {
  const [ofertas, setOfertas] = useState<EmpleoAdmin[]>([]);
  const [resumen, setResumen] = useState<OfertasResumenAdmin | null>(null);
  const [fuentes, setFuentes] = useState<FuenteAdmin[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [filtros, setFiltros] = useState<ListOfertasFiltros>({});
  const [form, setForm] = useState<CreateEmpleoAdminInput>(formularioVacio);
  const [editId, setEditId] = useState<string | null>(null);
  const [clasificarId, setClasificarId] = useState<string | null>(null);
  const [clasificarForm, setClasificarForm] = useState<ClasificarOfertaInput>({
    modalidad: "remoto",
    categoria: "tecnologia",
    tipoOportunidad: "empleo",
    habilidadesRequeridas: ["comunicación"],
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, kpis, fuentesData, empresasData] = await Promise.all([
        fetchAdminEmpleos(filtros),
        fetchAdminEmpleosResumen(),
        fetchAdminFuentes(),
        fetchAdminEmpresas(),
      ]);
      setOfertas(lista.ofertas);
      setResumen(kpis);
      setFuentes(fuentesData.filter((f) => f.activa));
      setEmpresas(empresasData.filter((e) => e.activa));
      setForm((prev) => {
        if (prev.fuenteId) return prev;
        if (fuentesData.length === 0) return prev;
        const institucional =
          fuentesData.find((f) => f.tipo === "institucional") ?? fuentesData[0];
        return { ...prev, fuenteId: Number(institucional.id) };
      });
    } catch {
      setMensaje("No se pudieron cargar las ofertas.");
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function actualizarCampo<K extends keyof CreateEmpleoAdminInput>(
    key: K,
    value: CreateEmpleoAdminInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function iniciarEdicion(oferta: EmpleoAdmin) {
    setEditId(oferta.id);
    setForm({
      title: oferta.title,
      company: oferta.company,
      fuenteId: Number(oferta.fuenteId ?? 0),
      empresaId: oferta.empresaId ? Number(oferta.empresaId) : undefined,
      location: oferta.location ?? "",
      modalidad: (oferta.modalidad as CreateEmpleoAdminInput["modalidad"]) ?? "remoto",
      categoria: (oferta.categoria as CreateEmpleoAdminInput["categoria"]) ?? "tecnologia",
      tipoOportunidad:
        (oferta.tipoOportunidad as CreateEmpleoAdminInput["tipoOportunidad"]) ?? "empleo",
      descripcion: oferta.descripcion ?? "",
      urlOferta: oferta.urlOferta ?? "",
      salario: oferta.salario ?? "",
      fechaPublicacion: oferta.fechaPublicacion ?? "",
      fechaCierre: oferta.fechaCierre ?? "",
      habilidadesRequeridas: oferta.habilidadesRequeridas ?? [],
    });
    setMensaje(null);
  }

  function cancelarEdicion() {
    setEditId(null);
    setForm((prev) => ({
      ...formularioVacio,
      fuenteId: prev.fuenteId || formularioVacio.fuenteId,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setGuardando(true);
    setMensaje(null);
    const payload: CreateEmpleoAdminInput = {
      ...form,
      location: form.location || undefined,
      descripcion: form.descripcion || undefined,
      urlOferta: form.urlOferta || undefined,
      salario: form.salario || undefined,
      fechaPublicacion: form.fechaPublicacion || undefined,
      fechaCierre: form.fechaCierre || undefined,
    };
    try {
      if (editId) {
        await updateAdminEmpleo(editId, payload);
        setMensaje("Oferta actualizada.");
      } else {
        await createAdminEmpleo(payload);
        setMensaje("Oferta registrada en borrador.");
      }
      cancelarEdicion();
      await cargar();
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "No se pudo guardar la oferta.");
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarAccion(
    accion: () => Promise<EmpleoAdmin>,
    okMsg: string,
  ) {
    setGuardando(true);
    setMensaje(null);
    try {
      await accion();
      setMensaje(okMsg);
      await cargar();
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "No se pudo completar la acción.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleClasificar(event: React.FormEvent) {
    event.preventDefault();
    if (!clasificarId) return;
    await ejecutarAccion(
      () => clasificarAdminEmpleo(clasificarId, clasificarForm),
      "Oferta clasificada.",
    );
    setClasificarId(null);
  }

  async function handleRechazar(id: string) {
    const motivo = window.prompt("Motivo del rechazo (mín. 5 caracteres):");
    if (!motivo || motivo.trim().length < 5) return;
    await ejecutarAccion(
      () => rechazarAdminEmpleo(id, motivo.trim()),
      "Oferta rechazada.",
    );
  }

  return (
    <>
      <header className="page-header">
        <h1>Gestión de ofertas (O2)</h1>
        <p>
          Ciclo completo Bizagi: crear, validar, clasificar, publicar y cerrar ofertas
          laborales y prácticas.{" "}
          <Link to="/admin/empresas">Empresas</Link> ·{" "}
          <Link to="/admin/fuentes">Fuentes</Link>
        </p>
      </header>

      {resumen ? (
        <section className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: "Total", value: resumen.total },
            { label: "Borrador", value: resumen.borrador },
            { label: "Pendientes", value: resumen.pendienteValidacion },
            { label: "Validadas", value: resumen.validada },
            { label: "Publicadas", value: resumen.publicada },
            { label: "Cerradas", value: resumen.cerrada },
          ].map((kpi) => (
            <div key={kpi.label} className="stat-card card">
              <span className="stat-card__label">{kpi.label}</span>
              <strong className="stat-card__value">{kpi.value}</strong>
            </div>
          ))}
        </section>
      ) : null}

      <section className="card detail-main admin-form-card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>
          {editId ? "Editar oferta" : "Nueva oferta"}
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
                list="empresas-list"
                value={form.company}
                onChange={(e) => actualizarCampo("company", e.target.value)}
              />
              <datalist id="empresas-list">
                {empresas.map((e) => (
                  <option key={e.id} value={e.nombre} />
                ))}
              </datalist>
            </label>
            <label>
              Fuente *
              <select
                required
                value={form.fuenteId || ""}
                onChange={(e) => actualizarCampo("fuenteId", Number(e.target.value))}
              >
                <option value="" disabled>
                  Seleccionar fuente
                </option>
                {fuentes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
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
              Categoría
              <select
                value={form.categoria}
                onChange={(e) =>
                  actualizarCampo(
                    "categoria",
                    e.target.value as CreateEmpleoAdminInput["categoria"],
                  )
                }
              >
                <option value="tecnologia">Tecnología</option>
                <option value="negocios">Negocios</option>
                <option value="diseno">Diseño</option>
                <option value="ingenieria">Ingeniería</option>
                <option value="marketing">Marketing</option>
                <option value="salud">Salud</option>
                <option value="otros">Otros</option>
              </select>
            </label>
            <label>
              Tipo oportunidad
              <select
                value={form.tipoOportunidad}
                onChange={(e) =>
                  actualizarCampo(
                    "tipoOportunidad",
                    e.target.value as CreateEmpleoAdminInput["tipoOportunidad"],
                  )
                }
              >
                <option value="empleo">Empleo</option>
                <option value="practica">Práctica</option>
                <option value="convenio">Convenio</option>
                <option value="freelance">Freelance</option>
              </select>
            </label>
            <label>
              Fecha cierre *
              <input
                type="date"
                min={fechaMinima()}
                value={form.fechaCierre ?? ""}
                onChange={(e) => actualizarCampo("fechaCierre", e.target.value)}
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
              Salario
              <input
                value={form.salario}
                onChange={(e) => actualizarCampo("salario", e.target.value)}
              />
            </label>
          </div>
          <label>
            Descripción (mín. 20 caracteres para publicar)
            <textarea
              rows={4}
              value={form.descripcion}
              onChange={(e) => actualizarCampo("descripcion", e.target.value)}
            />
          </label>
          <label>
            URL de la oferta
            <input
              type="url"
              value={form.urlOferta}
              onChange={(e) => actualizarCampo("urlOferta", e.target.value)}
            />
          </label>
          <div className="modal__actions">
            {editId ? (
              <button type="button" className="btn btn--secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            ) : null}
            <button type="submit" className="btn btn--primary" disabled={guardando}>
              {guardando ? "Guardando..." : editId ? "Actualizar" : "Guardar borrador"}
            </button>
          </div>
        </form>
        {mensaje ? (
          <p className="detail-actions__msg" role="status">
            {mensaje}
          </p>
        ) : null}
      </section>

      {clasificarId ? (
        <section className="card detail-main admin-form-card" style={{ marginTop: 24 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Clasificar oferta #{clasificarId}</h2>
          <form className="admin-form" onSubmit={(e) => void handleClasificar(e)}>
            <div className="admin-form__grid">
              <label>
                Modalidad
                <select
                  value={clasificarForm.modalidad}
                  onChange={(e) =>
                    setClasificarForm((p) => ({
                      ...p,
                      modalidad: e.target.value as ClasificarOfertaInput["modalidad"],
                    }))
                  }
                >
                  <option value="remoto">Remoto</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </label>
              <label>
                Categoría
                <select
                  value={clasificarForm.categoria}
                  onChange={(e) =>
                    setClasificarForm((p) => ({
                      ...p,
                      categoria: e.target.value as ClasificarOfertaInput["categoria"],
                    }))
                  }
                >
                  <option value="tecnologia">Tecnología</option>
                  <option value="negocios">Negocios</option>
                  <option value="diseno">Diseño</option>
                  <option value="ingenieria">Ingeniería</option>
                  <option value="marketing">Marketing</option>
                  <option value="salud">Salud</option>
                  <option value="otros">Otros</option>
                </select>
              </label>
              <label>
                Tipo
                <select
                  value={clasificarForm.tipoOportunidad}
                  onChange={(e) =>
                    setClasificarForm((p) => ({
                      ...p,
                      tipoOportunidad: e.target
                        .value as ClasificarOfertaInput["tipoOportunidad"],
                    }))
                  }
                >
                  <option value="empleo">Empleo</option>
                  <option value="practica">Práctica</option>
                  <option value="convenio">Convenio</option>
                  <option value="freelance">Freelance</option>
                </select>
              </label>
              <label>
                Habilidades (coma)
                <input
                  value={clasificarForm.habilidadesRequeridas.join(", ")}
                  onChange={(e) =>
                    setClasificarForm((p) => ({
                      ...p,
                      habilidadesRequeridas: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </label>
            </div>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setClasificarId(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={guardando}>
                Clasificar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section style={{ marginTop: 32 }}>
        <div className="section-heading">
          <h2>Ofertas registradas</h2>
          <Link to="/admin/reportes">Ver reportes →</Link>
        </div>

        <div className="admin-form__grid" style={{ marginBottom: 16 }}>
          <label>
            Estado
            <select
              value={filtros.estado ?? ""}
              onChange={(e) =>
                setFiltros((p) => ({
                  ...p,
                  estado: (e.target.value || undefined) as EstadoOferta | undefined,
                }))
              }
            >
              {ESTADOS.map((e) => (
                <option key={e.label} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Modalidad
            <select
              value={filtros.modalidad ?? ""}
              onChange={(e) =>
                setFiltros((p) => ({
                  ...p,
                  modalidad: (e.target.value || undefined) as ListOfertasFiltros["modalidad"],
                }))
              }
            >
              <option value="">Todas</option>
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </label>
          <label>
            Buscar
            <input
              placeholder="Título o empresa"
              value={filtros.q ?? ""}
              onChange={(e) => setFiltros((p) => ({ ...p, q: e.target.value || undefined }))}
            />
          </label>
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
                  <th>Cierre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ofertas.map((oferta) => (
                  <tr key={oferta.id}>
                    <td>
                      <Link to={`/empleos/${oferta.id}`} className="data-table__link">
                        {oferta.title}
                      </Link>
                      {oferta.vencida ? (
                        <small style={{ display: "block", color: "#b45309" }}>Vencida</small>
                      ) : null}
                    </td>
                    <td>{oferta.company}</td>
                    <td>{oferta.fuenteNombre ?? "—"}</td>
                    <td>{etiquetaModalidad(oferta.modalidad)}</td>
                    <td>{oferta.fechaCierre ?? "—"}</td>
                    <td>
                      <span className={claseEstado(oferta.estado)}>
                        {etiquetaEstado(oferta.estado)}
                      </span>
                    </td>
                    <td>
                      <div className="empleo-card__actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          disabled={guardando}
                          onClick={() => iniciarEdicion(oferta)}
                        >
                          Editar
                        </button>
                        {["borrador", "pendiente_validacion"].includes(oferta.estado) ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            disabled={guardando}
                            onClick={() =>
                              void ejecutarAccion(
                                () => validarAdminEmpleo(oferta.id),
                                "Oferta validada.",
                              )
                            }
                          >
                            Validar
                          </button>
                        ) : null}
                        {!["rechazada", "cerrada", "archivada"].includes(oferta.estado) ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            disabled={guardando}
                            onClick={() => setClasificarId(oferta.id)}
                          >
                            Clasificar
                          </button>
                        ) : null}
                        {oferta.estado === "validada" ? (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            disabled={guardando}
                            onClick={() =>
                              void ejecutarAccion(
                                () => publicarAdminEmpleo(oferta.id),
                                "Oferta publicada.",
                              )
                            }
                          >
                            Publicar
                          </button>
                        ) : null}
                        {oferta.estado === "publicada" ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            disabled={guardando}
                            onClick={() =>
                              void ejecutarAccion(
                                () => cerrarAdminEmpleo(oferta.id),
                                "Oferta cerrada.",
                              )
                            }
                          >
                            Cerrar
                          </button>
                        ) : null}
                        {!["publicada", "cerrada", "archivada", "rechazada"].includes(
                          oferta.estado,
                        ) ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            disabled={guardando}
                            onClick={() => void handleRechazar(oferta.id)}
                          >
                            Rechazar
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          disabled={guardando}
                          onClick={() =>
                            void ejecutarAccion(
                              () => setAdminEmpleoActivo(oferta.id, !oferta.activo),
                              oferta.activo ? "Oferta archivada." : "Oferta reactivada.",
                            )
                          }
                        >
                          {oferta.activo ? "Archivar" : "Reactivar"}
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
