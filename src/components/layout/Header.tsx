
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() || '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-90 transition-all duration-300 ease-out border-b',
          isScrolled || !isHome
            ? 'bg-cream/95 backdrop-blur-md shadow-sm border-dark/10 py-4'
            : 'bg-transparent border-white/10 py-6'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group relative z-10">
              <div
                className={cn(
                  'font-display text-xl md:text-2xl font-black uppercase tracking-widest transition-colors',
                  isScrolled || !isHome ? 'text-dark' : 'text-white'
                )}
              >
                Recanto <span className={cn(isScrolled || !isHome ? 'text-primary' : 'text-secondary')}>Matuto</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative font-bold text-xs uppercase tracking-[0.15em] transition-colors py-2',
                    isScrolled || !isHome
                      ? 'text-dark/60 hover:text-dark'
                      : 'text-white/70 hover:text-white',
                    pathname === link.href && (isScrolled || !isHome ? 'text-dark' : 'text-white')
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className={cn(
                        "absolute bottom-0 left-0 right-0 h-px",
                        isScrolled || !isHome ? "bg-dark" : "bg-white"
                      )}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <Button
                asChild
                className={cn(
                  "hidden md:inline-flex rounded-none text-xs tracking-widest font-bold uppercase border",
                  isScrolled || !isHome 
                    ? "bg-dark text-white border-dark hover:bg-white hover:text-dark" 
                    : "bg-white text-dark border-white hover:bg-transparent hover:text-white"
                )}
                size="sm"
              >
                <Link href="/reservas">Reservar</Link>
              </Button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'lg:hidden p-2 rounded-none transition-colors border',
                  isScrolled || !isHome
                    ? 'text-dark border-dark hover:bg-dark hover:text-white'
                    : 'text-white border-white hover:bg-white hover:text-dark'
                )}
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
