'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Clock3 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/features/admin/layout/components/AdminSidebar';
import { ToastProvider } from '@/components/ui/Toast';

function formatSessionRemaining(expiresAt: number | null): string {
  if (!expiresAt) return 'Sessão ativa';
  const expiresMs = expiresAt * 1000;
  const remainingMs = expiresMs - Date.now();
  if (remainingMs <= 0) return 'Sessão expirada';

  const totalMinutes = Math.floor(remainingMs / 60000);
  if (totalMinutes < 1) return 'Expira em <1min';
  if (totalMinutes < 60) return `Expira em ${totalMinutes}min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `Expira em ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const { user, session, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [_minuteTick, setMinuteTick] = useState(0);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && isAuthenticated && isLoginPage) {
      router.push('/admin');
    }

    if (!loading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, isLoginPage, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMinuteTick((prev) => prev + 1);
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const sessionLabel = formatSessionRemaining(session?.expiresAt ?? null);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-texture-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const canGoBack = pathname !== '/admin';

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/admin');
  };

  return (
    <div className="admin-texture-bg min-h-screen">
      <AdminSidebar />

      <div className="lg:ml-64 pt-16 lg:pt-0">
        <header className="bg-white/90 backdrop-blur border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {canGoBack && (
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}
            <div className="min-w-0">
              <p className="text-gray-800 font-semibold truncate">
                Olá, <span className="text-primary">{user?.name || 'Admin'}</span>
              </p>
              <p className="text-xs text-gray-500">Painel administrativo seguro</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sessão protegida
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 text-xs font-medium">
              <Clock3 className="w-3.5 h-3.5" />
              {sessionLabel}
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex text-sm text-gray-500 hover:text-primary transition-colors"
            >
              Ver site →
            </a>
          </div>
        </header>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminContent>{children}</AdminContent>
      </ToastProvider>
    </AuthProvider>
  );
}
