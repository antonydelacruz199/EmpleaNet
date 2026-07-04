import { signAccessToken } from "../../core/auth/jwt.js";
import { AuditoriaRepository } from "../../core/auditoria/auditoria.repository.js";
import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { RecomendacionesService } from "../recomendaciones/recomendaciones.service.js";
import {
  AUTH_LOCK_MAX_ATTEMPTS,
  AUTH_LOCK_MINUTES,
  DEMO_USERS,
  type ForgotPasswordBody,
  type LoginBody,
  type LoginResponse,
  type MessageResponse,
  type RegisterBody,
  type ResetPasswordBody,
  type UsuarioPublico,
} from "./auth.schema.js";
import { AuthRepository } from "./auth.repository.js";

export class AuthService {
  private readonly authRepository = new AuthRepository();
  private readonly recomendacionesService = new RecomendacionesService();
  private readonly auditoriaRepository = new AuditoriaRepository();

  private demoDefaults(email: string) {
    return (
      DEMO_USERS.find((u) => u.email === email.toLowerCase()) ?? {
        name: email.split("@")[0] ?? "Usuario",
        skills: "typescript,react",
        location: "Remoto",
      }
    );
  }

  private toPublicUser(
    usuario: { id: number; email: string; rol: AuthUser["rol"] },
    perfil: { id: number; nombre: string; perfil_completo: number } | null,
  ): UsuarioPublico {
    return {
      id: String(usuario.id),
      email: usuario.email,
      rol: usuario.rol,
      name: perfil?.nombre ?? usuario.email,
      perfilId: perfil ? String(perfil.id) : null,
      perfilCompleto: perfil ? perfil.perfil_completo === 1 : false,
    };
  }

  private buildSession(
    usuario: NonNullable<ReturnType<AuthRepository["findById"]>>,
    perfil: NonNullable<ReturnType<AuthRepository["findPerfilByUsuarioId"]>>,
  ): LoginResponse {
    const authUser: AuthUser = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      perfilId: perfil.id,
    };

    return {
      token: signAccessToken(authUser),
      user: this.toPublicUser(usuario, perfil),
    };
  }

  private async afterSuccessfulLogin(
    usuario: NonNullable<ReturnType<AuthRepository["verifyCredentials"]>>,
  ): Promise<LoginResponse> {
    this.authRepository.resetFailedLoginAttempts(usuario.id);

    const defaults = this.demoDefaults(usuario.email);
    const perfil = this.authRepository.ensurePerfilForUsuario(
      usuario,
      defaults,
      1,
    );

    if (usuario.rol === "estudiante" || usuario.rol === "egresado") {
      if (perfil.perfil_completo === 1) {
        await this.recomendacionesService.recalcularParaPerfil(perfil.id);
      }
    }

    this.auditoriaRepository.registrar({
      usuarioId: usuario.id,
      accion: "login_exitoso",
      entidad: "usuario",
      detalle: usuario.rol,
    });

    return this.buildSession(usuario, perfil);
  }

  async login(body: LoginBody): Promise<LoginResponse> {
    const email = body.email.trim().toLowerCase();
    const existing = this.authRepository.findByEmail(email);

    if (existing && this.authRepository.isAccountLocked(existing)) {
      this.auditoriaRepository.registrar({
        usuarioId: existing.id,
        accion: "login_bloqueado",
        entidad: "usuario",
        detalle: email,
      });
      throw new AppError(
        429,
        `Cuenta bloqueada temporalmente. Intenta en ${AUTH_LOCK_MINUTES} minutos.`,
      );
    }

    const usuario = this.authRepository.verifyCredentials(
      body.email,
      body.password,
    );

    if (!usuario) {
      if (existing) {
        const intentos = this.authRepository.recordFailedLogin(existing);
        this.auditoriaRepository.registrar({
          usuarioId: existing.id,
          accion: "login_fallido",
          entidad: "usuario",
          detalle: `${email} (${intentos}/${AUTH_LOCK_MAX_ATTEMPTS})`,
        });
      } else {
        this.auditoriaRepository.registrar({
          accion: "login_fallido",
          entidad: "usuario",
          detalle: email,
        });
      }
      throw new AppError(401, "Credenciales inválidas");
    }

    return this.afterSuccessfulLogin(usuario);
  }

  async register(body: RegisterBody): Promise<LoginResponse> {
    const email = body.email.trim().toLowerCase();
    if (this.authRepository.findByEmail(email)) {
      throw new AppError(409, "El correo ya está registrado");
    }

    const usuario = this.authRepository.createUser(body);
    const perfil = this.authRepository.findPerfilByUsuarioId(usuario.id);
    if (!perfil) {
      throw new AppError(500, "No se pudo crear el perfil del usuario");
    }

    this.auditoriaRepository.registrar({
      usuarioId: usuario.id,
      accion: "registro_usuario",
      entidad: "usuario",
      detalle: body.rol,
    });

    return this.buildSession(usuario, perfil);
  }

  forgotPassword(body: ForgotPasswordBody): MessageResponse {
    const email = body.email.trim().toLowerCase();
    const usuario = this.authRepository.findByEmail(email);
    let devResetToken: string | undefined;

    if (usuario && usuario.activo === 1) {
      const token = this.authRepository.createPasswordResetToken(usuario.id);
      this.auditoriaRepository.registrar({
        usuarioId: usuario.id,
        accion: "password_reset_solicitado",
        entidad: "usuario",
        detalle: email,
      });
      if (process.env.NODE_ENV !== "production") {
        devResetToken = token;
      }
    }

    return {
      message:
        "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.",
      ...(devResetToken ? { devResetToken } : {}),
    };
  }

  resetPassword(body: ResetPasswordBody): MessageResponse {
    const usuario = this.authRepository.consumePasswordResetToken(
      body.token,
      body.password,
    );

    if (!usuario) {
      throw new AppError(400, "Token inválido o expirado");
    }

    this.auditoriaRepository.registrar({
      usuarioId: usuario.id,
      accion: "password_reset_completado",
      entidad: "usuario",
      detalle: usuario.email,
    });

    return {
      message: "Contraseña restablecida correctamente. Ya puedes iniciar sesión.",
    };
  }

  me(auth: AuthUser): UsuarioPublico {
    const usuario = this.authRepository.findById(auth.userId);
    if (!usuario || usuario.activo !== 1) {
      throw new AppError(401, "Usuario no encontrado");
    }
    const perfil = auth.perfilId
      ? this.authRepository.findPerfilByUsuarioId(auth.userId)
      : null;
    return this.toPublicUser(usuario, perfil);
  }
}
