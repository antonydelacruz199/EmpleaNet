import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchFuentes } from "../fuentes/api";
import type { Fuente } from "../fuentes/api";
import { fetchEmpleos } from "./api";
import { EmpleoCard } from "./EmpleoCard";
import type { Empleo } from "./tipos";

const MODALIDADES = [
  { value: "", label: "Todas" },
  { value: "remoto", label: "Remoto" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
];

const CATEGORIAS = [
  { value: "", label: "Todas" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "negocios", label: "Negocios" },
  { value: "diseno", label: "Diseño" },
  { value: "ingenieria", label: "Ingeniería" },
  { value: "marketing", label: "Marketing" },
  { value: "salud", label: "Salud" },
  { value: "otros", label: "Otros" },
];

const LIMIT = 10;

export function EmpleosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [empleos, setEmpleos] = useState<Empleo[]>([]);
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const q = searchParams.get("q") ?? "";
  const ubicacion = searchParams.get("ubicacion") ?? "";
  const modalidad = searchParams.get("modalidad") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const empresa = searchParams.get("empresa") ?? "";
  const fechaDesde = searchParams.get("fechaDesde") ?? "";
  const fechaHasta = searchParams.get("fechaHasta") ?? "";
  const fuente = searchParams.get("fuente") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [draftQ, setDraftQ] = useState(q);
  const [draftUbicacion, setDraftUbicacion] = useState(ubicacion);
  const [draftEmpresa, setDraftEmpresa] = useState(empresa);

  useEffect(() => {
    setDraftQ(q);
  }, [q]);

  useEffect(() => {
    setDraftUbicacion(ubicacion);
  }, [ubicacion]);

  useEffect(() => {
    setDraftEmpresa(empresa);
  }, [empresa]);

  const actualizarParam = useCallback(
    (cambios: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(cambios)) {
          if (value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        if (!("page" in cambios)) {
          next.delete("page");
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const aplicarBusqueda = useCallback(() => {
    actualizarParam({
      q: draftQ || null,
      ubicacion: draftUbicacion || null,
      empresa: draftEmpresa || null,
    });
  }, [actualizarParam, draftQ, draftUbicacion, draftEmpresa]);

  useEffect(() => {
    let cancelled = false;
    void fetchFuentes()
      .then((data) => {
        if (!cancelled) setFuentes(data.filter((f) => f.enabled));
      })
      .catch(() => {
        if (!cancelled) setFuentes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    setError(null);
    void fetchEmpleos({
      q: q || undefined,
      ubicacion: ubicacion || undefined,
      modalidad: modalidad || undefined,
      categoria: categoria || undefined,
      empresa: empresa || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      fuente: fuente || undefined,
      page,
      limit: LIMIT,
    })
      .then((data) => {
        if (!cancelled) {
          setEmpleos(data.empleos);
          setTotal(data.total);
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las oportunidades.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, ubicacion, modalidad, categoria, empresa, fechaDesde, fechaHasta, fuente, page]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));

  function limpiarFiltros() {
    setSearchParams({});
  }

  return (
    <>
      <header className="page-header">
        <h1>Marketplace de Oportunidades</h1>
        <p>
          Encuentra empleos y prácticas centralizadas para la comunidad de la
          Universidad Continental.
        </p>
      </header>

      <div className="marketplace-layout">
        <aside className="card filters-panel">
          <div className="filters-panel__header">
            <h2>Filtros</h2>
            <button type="button" className="btn btn--ghost" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          <div className="field">
            <label htmlFor="filtro-q">Buscar</label>
            <input
              id="filtro-q"
              type="search"
              placeholder="Título, empresa..."
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") aplicarBusqueda();
              }}
              onBlur={aplicarBusqueda}
            />
          </div>

          <div className="field">
            <label htmlFor="filtro-ubicacion">Ubicación</label>
            <input
              id="filtro-ubicacion"
              type="text"
              placeholder="Ej. Lima, Remoto..."
              value={draftUbicacion}
              onChange={(e) => setDraftUbicacion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") aplicarBusqueda();
              }}
              onBlur={aplicarBusqueda}
            />
          </div>

          <div className="field">
            <label htmlFor="filtro-empresa">Empresa</label>
            <input
              id="filtro-empresa"
              type="text"
              placeholder="Nombre de empresa"
              value={draftEmpresa}
              onChange={(e) => setDraftEmpresa(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") aplicarBusqueda();
              }}
              onBlur={aplicarBusqueda}
            />
          </div>

          <div className="field">
            <span>Categoría</span>
            <div className="chip-group" role="group" aria-label="Categoría">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.value || "all-cat"}
                  type="button"
                  className={`chip${categoria === c.value ? " chip--active" : ""}`}
                  onClick={() => actualizarParam({ categoria: c.value || null })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="filtro-fecha-desde">Publicadas desde</label>
            <input
              id="filtro-fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) =>
                actualizarParam({ fechaDesde: e.target.value || null })
              }
            />
          </div>

          <div className="field">
            <label htmlFor="filtro-fecha-hasta">Publicadas hasta</label>
            <input
              id="filtro-fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) =>
                actualizarParam({ fechaHasta: e.target.value || null })
              }
            />
          </div>

          <div className="field">
            <span>Modalidad</span>
            <div className="chip-group" role="group" aria-label="Modalidad">
              {MODALIDADES.map((m) => (
                <button
                  key={m.value || "all"}
                  type="button"
                  className={`chip${modalidad === m.value ? " chip--active" : ""}`}
                  onClick={() => actualizarParam({ modalidad: m.value || null })}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="filtro-fuente">Fuente</label>
            <select
              id="filtro-fuente"
              value={fuente}
              onChange={(e) =>
                actualizarParam({ fuente: e.target.value || null })
              }
            >
              <option value="">Todas las fuentes</option>
              {fuentes.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className="empleos-list" aria-live="polite">
          {error ? <p className="alert" role="alert">{error}</p> : null}
          {cargando ? <p className="loading">Cargando oportunidades...</p> : null}

          {!cargando && !error && empleos.length === 0 ? (
            <div className="card empty-state">
              <p>No hay ofertas que coincidan con los filtros seleccionados.</p>
            </div>
          ) : null}

          {!cargando && !error
            ? empleos.map((empleo) => (
                <EmpleoCard key={empleo.id} empleo={empleo} />
              ))
            : null}

          {!cargando && !error && total > LIMIT ? (
            <nav className="pagination" aria-label="Paginación">
              <button
                type="button"
                className="btn btn--secondary"
                disabled={page <= 1}
                onClick={() =>
                  actualizarParam({ page: String(page - 1) })
                }
              >
                Anterior
              </button>
              <span className="pagination__info">
                Página {page} de {totalPaginas} ({total} resultados)
              </span>
              <button
                type="button"
                className="btn btn--secondary"
                disabled={page >= totalPaginas}
                onClick={() =>
                  actualizarParam({ page: String(page + 1) })
                }
              >
                Siguiente
              </button>
            </nav>
          ) : null}
        </section>
      </div>
    </>
  );
}
