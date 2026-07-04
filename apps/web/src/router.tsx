import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./core/auth/ProtectedRoute";
import { GuestRoute } from "./core/auth/GuestRoute";
import { LayoutPrincipal } from "./layouts/LayoutPrincipal";
import { EmpleoDetallePage } from "./modules/empleos/EmpleoDetallePage";
import { EmpleosPage } from "./modules/empleos/EmpleosPage";
import { PerfilPage } from "./modules/perfil/PerfilPage";
import { RecomendacionesPage } from "./modules/recomendaciones/RecomendacionesPage";
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
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
