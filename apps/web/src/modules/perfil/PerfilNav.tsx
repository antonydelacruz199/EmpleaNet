import { NavLink } from "react-router-dom";

const items = [
  { to: "/perfil", label: "Resumen", end: true },
  { to: "/perfil/editar", label: "Editar perfil" },
  { to: "/perfil/habilidades", label: "Habilidades" },
  { to: "/perfil/intereses", label: "Intereses" },
  { to: "/perfil/experiencia", label: "Experiencia" },
  { to: "/perfil/cv", label: "CV" },
];

export function PerfilNav() {
  return (
    <nav className="perfil-nav" aria-label="Secciones del perfil">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive ? "perfil-nav__link perfil-nav__link--active" : "perfil-nav__link"
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function CompletitudBar({
  porcentaje,
  completo,
}: {
  porcentaje: number;
  completo: boolean;
}) {
  return (
    <div className="completitud-card card">
      <div className="completitud-card__header">
        <strong>Completitud del perfil</strong>
        <span className={completo ? "badge badge--ok" : "badge badge--warn"}>
          {porcentaje}%
        </span>
      </div>
      <div className="completitud-bar" role="progressbar" aria-valuenow={porcentaje}>
        <div className="completitud-bar__fill" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="completitud-card__hint">
        {completo
          ? "Tu perfil está listo para recomendaciones personalizadas."
          : "Completa las secciones pendientes para mejorar tus coincidencias."}
      </p>
    </div>
  );
}
