import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="login-shell">
      <div className="login-panel">
        <aside className="login-hero" aria-hidden="true">
          <div className="login-hero__content">
            <p className="login-hero__institution">Universidad Continental</p>
            <h1>Conectando talento con grandes oportunidades.</h1>
            <p>
              Accede a la plataforma exclusiva para estudiantes, egresados y
              aliados de la Universidad Continental.
            </p>
          </div>
        </aside>

        <section className="login-form-wrap">
          <div className="login-form-header">
            <h2>Continental Oportunidades</h2>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}

export function AuthLinkRow({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="auth-link-row">{children}</p>;
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="auth-link">
      {children}
    </Link>
  );
}
