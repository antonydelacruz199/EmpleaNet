import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Inicio", end: true },
  { to: "/empleos", label: "Oportunidades" },
  { to: "/recomendados", label: "Recomendados" },
  { to: "/perfil", label: "Mi perfil" },
];

export function LayoutPrincipal() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__brand">Continental Oportunidades</span>
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
