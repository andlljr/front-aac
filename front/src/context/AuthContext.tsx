import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_URL } from "../../config";

type AuthCtx = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // carregar token salvo no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
    setHydrated(true);
  }, []);

  const login = async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      throw new Error(`Login falhou (${res.status})`);
    }

    const data = await res.json();
    const t = data.access_token as string;

    setToken(t);
    localStorage.setItem("token", t);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const authFetch: AuthCtx["authFetch"] = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // só seta Content-Type se não for FormData
    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(input, { ...init, headers });

    if (res.status === 401) logout();

    return res;
  };

  const value = useMemo(() => ({ token, login, logout, authFetch }), [token]);

  if (!hydrated) return null;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};