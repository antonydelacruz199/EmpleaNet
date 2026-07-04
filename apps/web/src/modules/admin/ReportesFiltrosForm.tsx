import type { ReportesFiltros } from "./tipos";

type Props = {
  filtros: ReportesFiltros;
  onChange: (filtros: ReportesFiltros) => void;
  mostrarEstado?: boolean;
  mostrarRol?: boolean;
  estadoOpciones?: { value: string; label: string }[];
};

export function ReportesFiltrosForm({
  filtros,
  onChange,
  mostrarEstado = false,
  mostrarRol = false,
  estadoOpciones = [],
}: Props) {
  return (
    <div className="filters-bar card">
      <label>
        Desde
        <input
          type="date"
          value={filtros.fechaDesde ?? ""}
          onChange={(e) =>
            onChange({ ...filtros, fechaDesde: e.target.value || undefined })
          }
        />
      </label>
      <label>
        Hasta
        <input
          type="date"
          value={filtros.fechaHasta ?? ""}
          onChange={(e) =>
            onChange({ ...filtros, fechaHasta: e.target.value || undefined })
          }
        />
      </label>
      {mostrarRol ? (
        <label>
          Rol
          <select
            value={filtros.rol ?? ""}
            onChange={(e) =>
              onChange({ ...filtros, rol: e.target.value || undefined })
            }
          >
            <option value="">Todos</option>
            <option value="estudiante">Estudiante</option>
            <option value="egresado">Egresado</option>
            <option value="empresa">Empresa</option>
            <option value="administrador">Administrador</option>
            <option value="soporte">Soporte</option>
          </select>
        </label>
      ) : null}
      {mostrarEstado && estadoOpciones.length > 0 ? (
        <label>
          Estado
          <select
            value={filtros.estado ?? ""}
            onChange={(e) =>
              onChange({ ...filtros, estado: e.target.value || undefined })
            }
          >
            <option value="">Todos</option>
            {estadoOpciones.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        onClick={() => onChange({})}
      >
        Limpiar filtros
      </button>
    </div>
  );
}
