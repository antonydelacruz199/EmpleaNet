import { Link } from "react-router-dom";

export function InicioPage() {
  return (
    <section className="card home-hero">
      <h1>Continental Oportunidades</h1>
      <p>
        Plataforma institucional de la Universidad Continental para centralizar
        ofertas laborales, practicar búsqueda eficiente y acceder a
        oportunidades relevantes para tu perfil académico.
      </p>
      <div className="home-hero__actions">
        <Link to="/empleos" className="btn btn--primary">
          Explorar oportunidades
        </Link>
        <Link to="/recomendados" className="btn btn--secondary">
          Ver recomendados
        </Link>
      </div>
    </section>
  );
}
