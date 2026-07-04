import { signAccessToken } from "../../core/auth/jwt.js";
import { AuditoriaRepository } from "../../core/auditoria/auditoria.repository.js";
import type { AuthUser } from "../../core/auth/types.js";
import { AppError } from "../../core/errors/AppError.js";
import { RecomendacionesService } from "../recomendaciones/recomendaciones.service.js";
import {
  DEMO_USERS,
  type LoginBody,
  type LoginResponse,
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
    perfil: { id: number; nombre: string } | null,
  ): UsuarioPublico {
    return {
      id: String(usuario.id),
      email: usuario.email,
      rol: usuario.rol,
      name: perfil?.nombre ?? usuario.email,
      perfilId: perfil ? String(perfil.id) : null,
    };
  }

  async login(body: LoginBody): Promise<LoginResponse> {
    const usuario = this.authRepository.verifyCredentials(body.email, body.password);
    if (!usuario) {
      throw new AppError(401, "Credenciales inválidas");
    }

    const defaults = this.demoDefaults(usuario.email);
    const perfil = this.authRepository.ensurePerfilForUsuario(usuario, defaults);

    if (usuario.rol === "estudiante" || usuario.rol === "egresado") {
      await this.recomendacionesService.recalcularParaPerfil(perfil.id);
    }

    const authUser: AuthUser = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      perfilId: perfil.id,
    };

    this.auditoriaRepository.registrar({
      usuarioId: usuario.id,
      accion: "login_exitoso",
      entidad: "usuario",
      detalle: usuario.rol,
    });

    return {
      token: signAccessToken(authUser),
      user: this.toPublicUser(usuario, perfil),
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
