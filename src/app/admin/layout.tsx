'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

function AdminContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, isLoginPage, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  // Show login page without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show protected content with sidebar
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="lg:ml-64 pt-16 lg:pt-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
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
            <p className="text-gray-800 font-medium">
              Olá, <span className="text-primary">{user?.name || 'Admin'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
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
