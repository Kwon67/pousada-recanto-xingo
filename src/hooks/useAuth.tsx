'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AdminSessionInfo {
  expiresAt: number | null;
  issuedAt: number | null;
}

interface AuthContextValue {
  user: User | null;
  session: AdminSessionInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    _username: string,
    _password: string
  ) => Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AdminSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          setUser(null);
          setSession(null);
          return;
        }

        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setSession(data.session ?? null);
        } else {
          setUser(null);
          setSession(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (!response.ok || !data.success || !data.user) {
          return {
            success: false,
            error: data.error || 'Usuário ou senha inválidos',
            retryAfterSeconds: data.retryAfterSeconds,
          };
        }

        setUser(data.user);
        setSession(data.session ?? null);
        router.push('/admin');
        return { success: true };
      } catch {
        return { success: false, error: 'Erro ao fazer login' };
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setUser(null);
    setSession(null);
    router.push('/admin/login');
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
