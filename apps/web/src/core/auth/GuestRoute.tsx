import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";

export function GuestRoute() {
  const { user, cargando } = useAuth();

  if (cargando) {
    return <p className="loading">Cargando...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
