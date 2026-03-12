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
  Search,
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
  const { user, logout } = useAuth();
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b]/95 backdrop-blur z-40 flex items-center justify-between px-4 border-b border-white/8">
        <span className="font-display text-lg font-bold text-white">
          Recanto do Matuto
        </span>
        <button
          onClick={() => setMenuOriginPath(mobileOpen ? null : pathname)}
          className="p-2 text-white/70 hover:text-white"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMenuOriginPath(null)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-[#1e293b] z-40 transform transition-transform duration-300 lg:translate-x-0 overflow-hidden border-r border-white/8',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <div>
                <h1 className="font-body text-base font-semibold text-white tracking-tight">
                  Recanto do Matuto
                </h1>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-white/70 placeholder:text-white/30 focus:outline-none focus:border-blue-500/40 focus:bg-white/8 transition-colors"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            <p className="text-[11px] uppercase tracking-wider text-white/30 px-3 pb-2 pt-3 font-medium">
              Menu
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOriginPath(null)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm',
                  isActive(item.href)
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info + Bottom actions */}
          <div className="p-3 border-t border-white/8 space-y-1">
            {/* User avatar and info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {(user?.name?.[0] || 'A').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-white/40 truncate">{user?.email || 'admin'}</p>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 w-full text-white/50 hover:bg-white/5 hover:text-white/80 rounded-lg transition-all duration-200 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="font-medium">Ver site</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-white/50 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
