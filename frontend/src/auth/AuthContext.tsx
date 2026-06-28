import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import { tokenStorage } from '../lib/token-storage';
import type { AuthUser, LoginResponse } from '../types/invoice';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // On boot, if a token exists, hydrate the user from /auth/me.
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setInitializing(false);
      return;
    }
    api
      .get<AuthUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    tokenStorage.set(data.accessToken);
    setUser(data.user);
  }

  function logout(): void {
    tokenStorage.clear();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout,
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
