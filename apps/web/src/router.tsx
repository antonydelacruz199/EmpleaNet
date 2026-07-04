import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./core/auth/ProtectedRoute";
import { GuestRoute } from "./core/auth/GuestRoute";
import { LayoutPrincipal } from "./layouts/LayoutPrincipal";
import { AdminEstrategicoPage } from "./modules/admin/AdminEstrategicoPage";
import { AdminOfertasPage } from "./modules/admin/AdminOfertasPage";
import { AdminReportesPage } from "./modules/admin/AdminReportesPage";
import { EmpleoDetallePage } from "./modules/empleos/EmpleoDetallePage";
import { EmpleosPage } from "./modules/empleos/EmpleosPage";
import { FavoritosPage } from "./modules/favoritos/FavoritosPage";
import { PerfilPage } from "./modules/perfil/PerfilPage";
import { PostulacionesPage } from "./modules/postulaciones/PostulacionesPage";
import { RecomendacionesPage } from "./modules/recomendaciones/RecomendacionesPage";
import { SoporteIncidenciasPage } from "./modules/soporte/SoporteIncidenciasPage";
import { SoporteMotorPage } from "./modules/soporte/SoporteMotorPage";
import { InicioPage } from "./pages/InicioPage";
import { LoginPage } from "./pages/LoginPage";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <LayoutPrincipal />,
        children: [
          { index: true, element: <InicioPage /> },
          { path: "empleos", element: <EmpleosPage /> },
          { path: "empleos/:id", element: <EmpleoDetallePage /> },
          {
            element: (
              <ProtectedRoute allowedRoles={["estudiante", "egresado"]} />
            ),
            children: [
              { path: "perfil", element: <PerfilPage /> },
              { path: "recomendados", element: <RecomendacionesPage /> },
              { path: "postulaciones", element: <PostulacionesPage /> },
              { path: "favoritos", element: <FavoritosPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["administrador"]} />,
            children: [
              { path: "admin/ofertas", element: <AdminOfertasPage /> },
              { path: "admin/reportes", element: <AdminReportesPage /> },
              { path: "admin/estrategico", element: <AdminEstrategicoPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["soporte"]} />,
            children: [
              { path: "soporte/motor", element: <SoporteMotorPage /> },
              { path: "soporte/incidencias", element: <SoporteIncidenciasPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
