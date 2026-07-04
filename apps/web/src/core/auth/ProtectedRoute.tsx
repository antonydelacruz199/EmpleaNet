import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { RolUsuario } from "../auth/authApi";

type Props = {
  allowedRoles?: RolUsuario[];
};

export function ProtectedRoute({ allowedRoles }: Props) {
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

  return <Outlet />;
}
