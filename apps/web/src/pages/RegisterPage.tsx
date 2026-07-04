import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { AuthLink, AuthLinkRow, AuthShell } from "../core/auth/AuthShell";
import { resolvePostAuthPath } from "../core/auth/authRedirects";
import type { RolRegistro } from "../core/auth/authApi";
import { HttpError } from "../core/http/clienteHttp";

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolRegistro>("estudiante");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (user) {
    return <Navigate to={resolvePostAuthPath(user)} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      const sessionUser = await register({
        email: email.trim(),
        password,
        confirmPassword,
        name: name.trim(),
        rol,
      });
      navigate(resolvePostAuthPath(sessionUser), { replace: true });
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        setError("El correo ya está registrado.");
      } else if (err instanceof HttpError && err.status === 400) {
        setError("Revisa los datos: contraseña segura (8+ chars, mayúscula, minúscula, número).");
      } else {
        setError("No se pudo completar el registro.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell
      title="Registro"
      subtitle="Crea tu cuenta en Continental Oportunidades."
      footer={
        <AuthLinkRow>
          ¿Ya tienes cuenta? <AuthLink to="/login">Iniciar sesión</AuthLink>
        </AuthLinkRow>
      }
    >
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      <form className="login-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="reg-name">Nombre completo</label>
          <input
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="field">
          <label htmlFor="reg-email">Correo electrónico</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="reg-rol">Tipo de cuenta</label>
          <select
            id="reg-rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as RolRegistro)}
          >
            <option value="estudiante">Estudiante</option>
            <option value="egresado">Egresado</option>
            <option value="empresa">Empresa / fuente externa</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="reg-password">Contraseña</label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="field">
          <label htmlFor="reg-confirm">Confirmar contraseña</label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          className="btn btn--primary login-submit"
          disabled={enviando}
        >
          {enviando ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}
