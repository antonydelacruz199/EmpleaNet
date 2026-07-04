import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { HttpError } from "../../core/http/clienteHttp";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("estudiante@continental.edu.pe");
  const [password, setPassword] = useState("Continental2026");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from ?? "/";

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else {
        setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-panel">
        <aside className="login-hero" aria-hidden="true">
          <div className="login-hero__content">
            <p className="login-hero__institution">Universidad Continental</p>
            <h1>Conectando talento con grandes oportunidades.</h1>
            <p>
              Accede a la plataforma exclusiva para estudiantes y egresados de la
              Universidad Continental.
            </p>
          </div>
        </aside>

        <section className="login-form-wrap">
          <div className="login-form-header">
            <h2>Continental Oportunidades</h2>
            <h3>Iniciar sesión</h3>
            <p>Ingresa tus credenciales institucionales para continuar.</p>
          </div>

          {error ? <p className="alert" role="alert">{error}</p> : null}

          <form className="login-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="login-email">Correo institucional</label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary login-submit"
              disabled={enviando}
            >
              {enviando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="login-demo-hint">
            Demo: estudiante@continental.edu.pe / Continental2026
          </p>
        </section>
      </div>
    </div>
  );
}
