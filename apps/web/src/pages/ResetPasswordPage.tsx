import { FormEvent, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { AuthLink, AuthLinkRow, AuthShell } from "../core/auth/AuthShell";
import { resetPasswordApi } from "../core/auth/authApi";
import { HttpError } from "../core/http/clienteHttp";

export function ResetPasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tokenFromUrl = useMemo(() => params.get("token") ?? "", [params]);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      const result = await resetPasswordApi({
        token: token.trim(),
        password,
        confirmPassword,
      });
      setMensaje(result.message);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      if (err instanceof HttpError && err.status === 400) {
        setError("Token inválido o expirado.");
      } else {
        setError("No se pudo restablecer la contraseña.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthShell
      title="Restablecer contraseña"
      subtitle="Define una nueva contraseña segura para tu cuenta."
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

      <form className="login-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="reset-token">Token de restablecimiento</label>
          <input
            id="reset-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="reset-password">Nueva contraseña</label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="field">
          <label htmlFor="reset-confirm">Confirmar contraseña</label>
          <input
            id="reset-confirm"
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
          {enviando ? "Guardando..." : "Restablecer contraseña"}
        </button>
      </form>
    </AuthShell>
  );
}
