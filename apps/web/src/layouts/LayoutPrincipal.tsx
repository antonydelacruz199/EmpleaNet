import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { isStudentRole } from "../core/auth/authApi";

const navEstudiante = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/empleos", label: "Oportunidades" },
  { to: "/recomendados", label: "Recomendados" },
  { to: "/postulaciones", label: "Postulaciones" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/perfil", label: "Mi perfil" },
];

const navInstitucional = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/empleos", label: "Oportunidades" },
];

function etiquetaRol(rol: string) {
  const map: Record<string, string> = {
    estudiante: "Estudiante",
    egresado: "Egresado",
    administrador: "Administrador",
    soporte: "Soporte técnico",
  };
  return map[rol] ?? rol;
}

export function LayoutPrincipal() {
  const { user, logout } = useAuth();
  const navItems =
    user && isStudentRole(user.rol) ? navEstudiante : navInstitucional;

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__brand">Continental Oportunidades</span>
        {user ? (
          <div className="app-header__user">
            <span className="app-header__user-info">
              {user.name}
              <small>{etiquetaRol(user.rol)}</small>
            </span>
            <button type="button" className="btn btn--secondary" onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </div>
        ) : null}
      </header>

      <aside className="app-sidebar">
        <div className="app-sidebar__institution">
          <h2>Gestión Institucional</h2>
          <p>Universidad Continental</p>
        </div>
        <nav aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `app-nav-link${isActive ? " app-nav-link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-main">
        <div className="app-main__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
