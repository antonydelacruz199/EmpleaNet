import { Link } from "react-router-dom";

export function InicioPage() {
  return (
    <section>
      <h1>EmpleaNet</h1>
      <p>Explora ofertas, filtra por criterios y obtén recomendaciones según tu perfil.</p>
      <p>
        <Link to="/empleos">Ver empleos</Link>
      </p>
      <p>
        <Link to="/perfil">Ver perfil</Link>
      </p>
    </section>
  );
}
