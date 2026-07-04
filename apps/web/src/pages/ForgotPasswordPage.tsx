import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { AuthLink, AuthLinkRow, AuthShell } from "../core/auth/AuthShell";
import { forgotPasswordApi } from "../core/auth/authApi";

export function ForgotPasswordPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setDevToken(null);
    setEnviando(true);
    try {
      const result = await forgotPasswordApi(email.trim());
      setMensaje(result.message);
      if (result.devResetToken) {
        setDevToken(result.devResetToken);
      }
    } catch {
      setError("No se pudo procesar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos instrucciones si el correo está registrado."
      footer={
        <AuthLinkRow>
          <AuthLink to="/login">Volver al inicio de sesión</AuthLink>
        </AuthLinkRow>
      }
    >
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}
      {mensaje ? (
        <p className="alert alert--success" role="status">
          {mensaje}
        </p>
      ) : null}
      {devToken ? (
        <p className="login-demo-hint">
          Token de desarrollo:{" "}
          <AuthLink to={`/restablecer-contrasena?token=${devToken}`}>
            restablecer contraseña
          </AuthLink>
        </p>
      ) : null}

      <form className="login-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="forgot-email">Correo electrónico</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn--primary login-submit"
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
    </AuthShell>
  );
}
