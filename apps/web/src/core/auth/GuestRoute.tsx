import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { resolvePostAuthPath } from "./authRedirects";

export function GuestRoute() {
  const { user, cargando } = useAuth();

  if (cargando) {
    return <p className="loading">Cargando...</p>;
  }

  if (user) {
    return <Navigate to={resolvePostAuthPath(user)} replace />;
  }

  return <Outlet />;
}
