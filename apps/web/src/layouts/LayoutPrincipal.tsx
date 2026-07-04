import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { isAdminRole, isSoporteRole, isStudentRole } from "../core/auth/authApi";

const navEstudiante = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/empleos", label: "Oportunidades" },
  { to: "/recomendados", label: "Recomendados" },
  { to: "/postulaciones", label: "Postulaciones" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/seguimiento", label: "Seguimiento" },
  { to: "/perfil", label: "Mi perfil" },
];

const navAdmin = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/admin/dashboard", label: "Panel admin" },
  { to: "/admin/ofertas", label: "Gestión ofertas" },
  { to: "/admin/empresas", label: "Empresas" },
  { to: "/admin/fuentes", label: "Fuentes" },
  { to: "/admin/reportes", label: "Reportes" },
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/estrategico", label: "Panel estratégico" },
  { to: "/empleos", label: "Oportunidades" },
];

const navSoporte = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/soporte/motor", label: "Motor recomendación" },
  { to: "/soporte/incidencias", label: "Incidencias" },
  { to: "/empleos", label: "Oportunidades" },
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
  const navItems = user
    ? isStudentRole(user.rol)
      ? navEstudiante
      : isAdminRole(user.rol)
        ? navAdmin
        : isSoporteRole(user.rol)
          ? navSoporte
          : navInstitucional
    : navInstitucional;

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
