import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchSessionUser,
  isStudentRole,
  loginApi,
  logoutApi,
  registerApi,
  type RolRegistro,
  type RolUsuario,
  type UsuarioSesion,
} from "./authApi";
import { clearAuthToken, getAuthToken } from "./tokenStorage";

type AuthContextValue = {
  user: UsuarioSesion | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<UsuarioSesion>;
  register: (input: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    rol: RolRegistro;
  }) => Promise<UsuarioSesion>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  rol: RolUsuario | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getAuthToken();
    if (!token) {
      setCargando(false);
      return;
    }
    void fetchSessionUser()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        clearAuthToken();
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      confirmPassword: string;
      name: string;
      rol: RolRegistro;
    }) => {
      const result = await registerApi(input);
      setUser(result.user);
      return result.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await fetchSessionUser();
    setUser(data);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      cargando,
      login,
      register,
      logout,
      refreshUser,
      isStudent: user ? isStudentRole(user.rol) : false,
      rol: user?.rol ?? null,
    }),
    [user, cargando, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
