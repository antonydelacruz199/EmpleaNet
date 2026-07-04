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
  type RolUsuario,
  type UsuarioSesion,
} from "./authApi";
import { clearAuthToken, getAuthToken } from "./tokenStorage";

type AuthContextValue = {
  user: UsuarioSesion | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      cargando,
      login,
      logout,
      isStudent: user ? isStudentRole(user.rol) : false,
      rol: user?.rol ?? null,
    }),
    [user, cargando, login, logout],
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
