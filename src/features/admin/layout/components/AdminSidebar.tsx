'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bed,
  Calendar,
  MessageSquare,
  Images,
  FileEdit,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/quartos', label: 'Quartos', icon: Bed },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: MessageSquare },
  { href: '/admin/galeria', label: 'Galeria', icon: Images },
  { href: '/admin/conteudo', label: 'Conteúdo do Site', icon: FileEdit },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [menuOriginPath, setMenuOriginPath] = useState<string | null>(null);
  const mobileOpen = menuOriginPath !== null && menuOriginPath === pathname;
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!mobileOpen) return;

    scrollPositionRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollPositionRef.current);

      requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark/95 backdrop-blur z-40 flex items-center justify-between px-4 border-b border-white/10">
        <span className="font-display text-lg font-bold text-secondary">
          Recanto do Matuto
        </span>
        <button
          onClick={() => setMenuOriginPath(mobileOpen ? null : pathname)}
          className="p-2 text-white"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-dark/50 z-30"
          onClick={() => setMenuOriginPath(null)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-[linear-gradient(180deg,#163244_0%,#102531_100%)] z-40 transform transition-transform duration-300 lg:translate-x-0 overflow-hidden border-r border-white/10',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="block">
              <h1 className="font-display text-xl font-bold text-secondary">
                Recanto do Matuto
              </h1>
              <p className="text-white/50 text-sm mt-1">Painel Administrativo</p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-[11px] uppercase tracking-wider text-white/40 px-4 pb-2">
              Navegação
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOriginPath(null)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm',
                  isActive(item.href)
                    ? 'bg-white text-dark shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/10 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 text-sm"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">Ver site</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
