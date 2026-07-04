import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { AuthLink, AuthLinkRow, AuthShell } from "../../core/auth/AuthShell";
import { resolvePostAuthPath } from "../../core/auth/authRedirects";
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
    return <Navigate to={resolvePostAuthPath(user, from)} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const sessionUser = await login(email.trim(), password);
      navigate(resolvePostAuthPath(sessionUser, from), { replace: true });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else if (err instanceof HttpError && err.status === 429) {
        setError(
          "Demasiados intentos fallidos. Tu cuenta está bloqueada temporalmente.",
        );
      } else {
        setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales institucionales para continuar."
      footer={
        <>
          <AuthLinkRow>
            <AuthLink to="/recuperar-contrasena">¿Olvidaste tu contraseña?</AuthLink>
          </AuthLinkRow>
          <AuthLinkRow>
            ¿No tienes cuenta? <AuthLink to="/registro">Registrarse</AuthLink>
          </AuthLinkRow>
          <p className="login-demo-hint">
            Demo: estudiante@continental.edu.pe / Continental2026
          </p>
        </>
      }
    >
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

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
    </AuthShell>
  );
}
