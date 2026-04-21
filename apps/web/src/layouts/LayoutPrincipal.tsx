import { NavLink, Outlet } from "react-router-dom";

export function LayoutPrincipal() {
  return (
    <>
      <header
        style={{
          display: "flex",
          gap: "1rem",
          padding: "0.75rem 1rem",
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <strong>EmpleaNet</strong>
        <nav style={{ display: "flex", gap: "0.75rem" }}>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/empleos">Empleos</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
          <NavLink to="/recomendados">Recomendados</NavLink>
        </nav>
      </header>
      <main style={{ padding: "1rem", maxWidth: "960px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </>
  );
}
