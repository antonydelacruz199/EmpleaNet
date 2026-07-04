import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./core/auth/ProtectedRoute";
import { GuestRoute } from "./core/auth/GuestRoute";
import { LayoutPrincipal } from "./layouts/LayoutPrincipal";
import { AdminEstrategicoPage } from "./modules/admin/AdminEstrategicoPage";
import { AdminOfertasPage } from "./modules/admin/AdminOfertasPage";
import { AdminReportesPage } from "./modules/admin/AdminReportesPage";
import { AdminUsuarioDetallePage } from "./modules/admin/AdminUsuarioDetallePage";
import { AdminUsuariosPage } from "./modules/admin/AdminUsuariosPage";
import { EmpleoDetallePage } from "./modules/empleos/EmpleoDetallePage";
import { EmpleosPage } from "./modules/empleos/EmpleosPage";
import { FavoritosPage } from "./modules/favoritos/FavoritosPage";
import { PerfilCvPage } from "./modules/perfil/PerfilCvPage";
import { PerfilEditarPage } from "./modules/perfil/PerfilEditarPage";
import { PerfilExperienciaPage } from "./modules/perfil/PerfilExperienciaPage";
import { PerfilHabilidadesPage } from "./modules/perfil/PerfilHabilidadesPage";
import { PerfilInteresesPage } from "./modules/perfil/PerfilInteresesPage";
import { PerfilOverviewPage } from "./modules/perfil/PerfilOverviewPage";
import { PostulacionesPage } from "./modules/postulaciones/PostulacionesPage";
import { RecomendacionesPage } from "./modules/recomendaciones/RecomendacionesPage";
import { SoporteIncidenciasPage } from "./modules/soporte/SoporteIncidenciasPage";
import { SoporteMotorPage } from "./modules/soporte/SoporteMotorPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { InicioPage } from "./pages/InicioPage";
import { LoginPage } from "./pages/LoginPage";
import { PrimerAccesoPage } from "./pages/PrimerAccesoPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

const perfilRoutes = [
  { path: "perfil", element: <PerfilOverviewPage /> },
  { path: "perfil/editar", element: <PerfilEditarPage /> },
  { path: "perfil/habilidades", element: <PerfilHabilidadesPage /> },
  { path: "perfil/intereses", element: <PerfilInteresesPage /> },
  { path: "perfil/experiencia", element: <PerfilExperienciaPage /> },
  { path: "perfil/cv", element: <PerfilCvPage /> },
];

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/registro", element: <RegisterPage /> },
      { path: "/recuperar-contrasena", element: <ForgotPasswordPage /> },
      { path: "/restablecer-contrasena", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute
        requirePerfilCompleto={false}
        allowedRoles={["estudiante", "egresado", "empresa"]}
      />
    ),
    children: [{ path: "/primer-acceso", element: <PrimerAccesoPage /> }],
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
              ...perfilRoutes,
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
              { path: "admin/usuarios", element: <AdminUsuariosPage /> },
              { path: "admin/usuarios/:usuarioId", element: <AdminUsuarioDetallePage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["soporte"]} />,
            children: [
              { path: "soporte/motor", element: <SoporteMotorPage /> },
              {
                path: "soporte/incidencias",
                element: <SoporteIncidenciasPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
