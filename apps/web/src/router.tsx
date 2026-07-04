import { createBrowserRouter } from "react-router-dom";
import { LayoutPrincipal } from "./layouts/LayoutPrincipal";
import { EmpleoDetallePage } from "./modules/empleos/EmpleoDetallePage";
import { EmpleosPage } from "./modules/empleos/EmpleosPage";
import { PerfilPage } from "./modules/perfil/PerfilPage";
import { RecomendacionesPage } from "./modules/recomendaciones/RecomendacionesPage";
import { InicioPage } from "./pages/InicioPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutPrincipal />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: "empleos", element: <EmpleosPage /> },
      { path: "empleos/:id", element: <EmpleoDetallePage /> },
      { path: "perfil", element: <PerfilPage /> },
      { path: "recomendados", element: <RecomendacionesPage /> },
    ],
  },
]);
