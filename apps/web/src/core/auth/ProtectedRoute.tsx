import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { RolUsuario } from "../auth/authApi";
import { needsPerfilCompleto } from "../auth/authRedirects";

type Props = {
  allowedRoles?: RolUsuario[];
  requirePerfilCompleto?: boolean;
};

export function ProtectedRoute({
  allowedRoles,
  requirePerfilCompleto = true,
}: Props) {
  const { user, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <p className="loading">Verificando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  if (
    requirePerfilCompleto &&
    needsPerfilCompleto(user) &&
    location.pathname !== "/primer-acceso"
  ) {
    return <Navigate to="/primer-acceso" replace />;
  }

  if (
    location.pathname === "/primer-acceso" &&
    !needsPerfilCompleto(user)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
