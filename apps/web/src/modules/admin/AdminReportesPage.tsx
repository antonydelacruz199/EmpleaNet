import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatearFecha } from "../postulaciones/utilidades";
import {
  downloadReportesCsv,
  downloadReportesJson,
  fetchReporteOfertas,
  fetchReportePostulaciones,
  fetchReporteRecomendaciones,
  fetchReporteUsuarios,
  fetchReportesKpis,
} from "./api";
import { BarChartSimple } from "./BarChartSimple";
import { ReportesFiltrosForm } from "./ReportesFiltrosForm";
import type {
  ListReporteResult,
  ReporteOfertaItem,
  ReportePostulacionItem,
  ReporteRecomendacionItem,
  ReporteUsuarioItem,
  ReportesFiltros,
  ReportesKpis,
} from "./tipos";

type Tab = "resumen" | "usuarios" | "ofertas" | "recomendaciones" | "postulaciones";

export function AdminReportesPage() {
  const [tab, setTab] = useState<Tab>("resumen");
  const [filtros, setFiltros] = useState<ReportesFiltros>({});
  const [kpis, setKpis] = useState<ReportesKpis | null>(null);
  const [usuarios, setUsuarios] = useState<ListReporteResult<ReporteUsuarioItem> | null>(
    null,
  );
  const [ofertas, setOfertas] = useState<ListReporteResult<ReporteOfertaItem> | null>(
    null,
  );
  const [recomendaciones, setRecomendaciones] = useState<
    ListReporteResult<ReporteRecomendacionItem> | null
  >(null);
  const [postulaciones, setPostulaciones] = useState<
    ListReporteResult<ReportePostulacionItem> | null
  >(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState<"csv" | "json" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    setError(null);

    const tareas: Promise<unknown>[] = [fetchReportesKpis(filtros)];

    if (tab === "usuarios") tareas.push(fetchReporteUsuarios(filtros));
    if (tab === "ofertas") tareas.push(fetchReporteOfertas(filtros));
    if (tab === "recomendaciones") tareas.push(fetchReporteRecomendaciones(filtros));
    if (tab === "postulaciones") tareas.push(fetchReportePostulaciones(filtros));

    void Promise.all(tareas)
      .then((results) => {
        if (cancelled) return;
        setKpis(results[0] as ReportesKpis);
        if (tab === "usuarios") setUsuarios(results[1] as ListReporteResult<ReporteUsuarioItem>);
        if (tab === "ofertas") setOfertas(results[1] as ListReporteResult<ReporteOfertaItem>);
        if (tab === "recomendaciones") {
          setRecomendaciones(results[1] as ListReporteResult<ReporteRecomendacionItem>);
        }
        if (tab === "postulaciones") {
          setPostulaciones(results[1] as ListReporteResult<ReportePostulacionItem>);
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los reportes.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, filtros]);

  async function handleExport(format: "csv" | "json") {
    setExportando(format);
    setError(null);
    try {
      if (format === "csv") await downloadReportesCsv(filtros);
      else await downloadReportesJson(filtros);
    } catch {
      setError(`No se pudo exportar ${format.toUpperCase()}.`);
    } finally {
      setExportando(null);
    }
  }

  const estadoOfertas = [
    { value: "publicada", label: "Publicada" },
    { value: "borrador", label: "Borrador" },
    { value: "cerrada", label: "Cerrada" },
    { value: "archivada", label: "Archivada" },
  ];

  const estadoPostulaciones = [
    { value: "registrada", label: "Registrada" },
    { value: "en_proceso", label: "En proceso" },
    { value: "cerrada", label: "Cerrada" },
  ];

  return (
    <>
      <header className="page-header">
        <h1>Reportes institucionales</h1>
        <p>Indicadores y tablas de uso de la plataforma (Bizagi O5).</p>
      </header>

      <div className="section-heading">
        <Link to="/admin/dashboard">← Dashboard admin</Link>
        <div className="empleo-card__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={exportando !== null || cargando}
            onClick={() => void handleExport("csv")}
          >
            {exportando === "csv" ? "Exportando..." : "Exportar CSV"}
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={exportando !== null || cargando}
            onClick={() => void handleExport("json")}
          >
            {exportando === "json" ? "Exportando..." : "Exportar JSON"}
          </button>
        </div>
      </div>

      <ReportesFiltrosForm
        filtros={filtros}
        onChange={setFiltros}
        mostrarRol={tab === "usuarios"}
        mostrarEstado={tab === "usuarios" || tab === "ofertas" || tab === "postulaciones"}
        estadoOpciones={
          tab === "usuarios"
            ? [
                { value: "activo", label: "Activo" },
                { value: "inactivo", label: "Inactivo" },
              ]
            : tab === "ofertas"
              ? estadoOfertas
              : tab === "postulaciones"
                ? estadoPostulaciones
                : []
        }
      />

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      <div className="tabs" role="tablist" style={{ marginTop: 16 }}>
        {(
          [
            ["resumen", "KPIs"],
            ["usuarios", "Usuarios"],
            ["ofertas", "Ofertas"],
            ["recomendaciones", "Recomendaciones"],
            ["postulaciones", "Postulaciones"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tabs__btn${tab === id ? " tabs__btn--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="loading">Cargando reportes...</p>
      ) : tab === "resumen" && kpis ? (
        <>
          <div className="stats-grid" style={{ marginTop: 24 }}>
            <div className="stat-card card">
              <span className="stat-card__label">Usuarios activos</span>
              <strong className="stat-card__value">{kpis.usuariosActivos}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Ofertas publicadas</span>
              <strong className="stat-card__value">{kpis.ofertasPublicadas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Recomendaciones</span>
              <strong className="stat-card__value">{kpis.recomendacionesGeneradas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Postulaciones</span>
              <strong className="stat-card__value">{kpis.postulacionesRegistradas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Postulaciones activas</span>
              <strong className="stat-card__value">{kpis.postulacionesActivas}</strong>
            </div>
            <div className="stat-card card">
              <span className="stat-card__label">Perfiles completos</span>
              <strong className="stat-card__value">{kpis.tasaPerfilCompleto}%</strong>
            </div>
          </div>

          <div className="detail-grid" style={{ marginTop: 24 }}>
            <section className="card detail-main">
              <BarChartSimple
                title="Ofertas por fuente"
                items={kpis.ofertasPorFuente.map((i) => ({
                  label: i.fuente,
                  value: i.total,
                }))}
              />
            </section>
            <aside className="card detail-sidebar">
              <h2 style={{ marginTop: 0, fontSize: 18 }}>KPIs derivados</h2>
              <dl>
                <dt>Puntaje promedio recomendación</dt>
                <dd>{kpis.recomendacionPuntajePromedio}</dd>
                <dt>Postulaciones / oferta</dt>
                <dd>{kpis.tasaPostulacionPorOferta}</dd>
                <dt>Favoritos guardados</dt>
                <dd>{kpis.favoritosGuardados}</dd>
              </dl>
            </aside>
          </div>
        </>
      ) : null}

      {tab === "usuarios" && usuarios ? (
        <ReporteTabla
          total={usuarios.total}
          headers={["Email", "Rol", "Estado", "Perfil", "Registro"]}
          rows={usuarios.items.map((u) => [
            u.email,
            u.rol,
            u.activo ? "Activo" : "Inactivo",
            u.perfilCompleto ? "Completo" : `${u.completitudPct}%`,
            formatearFecha(u.creadoEn),
          ])}
        />
      ) : null}

      {tab === "ofertas" && ofertas ? (
        <ReporteTabla
          total={ofertas.total}
          headers={["Título", "Empresa", "Estado", "Modalidad", "Fuente", "Creado"]}
          rows={ofertas.items.map((o) => [
            o.title,
            o.company,
            o.estado,
            o.modalidad ?? "—",
            o.fuenteNombre ?? "—",
            formatearFecha(o.creadoEn),
          ])}
        />
      ) : null}

      {tab === "recomendaciones" && recomendaciones ? (
        <ReporteTabla
          total={recomendaciones.total}
          headers={["Usuario", "Oferta", "Puntaje", "Fecha"]}
          rows={recomendaciones.items.map((r) => [
            r.perfilEmail,
            r.empleoTitulo,
            String(Math.round(r.puntaje)),
            formatearFecha(r.creadoEn),
          ])}
        />
      ) : null}

      {tab === "postulaciones" && postulaciones ? (
        <ReporteTabla
          total={postulaciones.total}
          headers={["Usuario", "Oferta", "Estado", "Fecha"]}
          rows={postulaciones.items.map((p) => [
            p.perfilEmail,
            p.empleoTitulo,
            p.estado,
            formatearFecha(p.fechaPostulacion),
          ])}
        />
      ) : null}
    </>
  );
}

function ReporteTabla({
  total,
  headers,
  rows,
}: {
  total: number;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section className="card detail-main" style={{ marginTop: 24 }}>
      <p className="table-footnote">Total registros: {total}</p>
      {rows.length === 0 ? (
        <p>Sin registros para los filtros seleccionados.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
