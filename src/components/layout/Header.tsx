
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import Button from '@/components/ui/app-button';
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
          'fixed top-0 left-0 right-0 z-90 transition-all duration-150 ease-out',
          isScrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-dark/5 py-3'
            : 'bg-transparent py-6'
        )}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className={cn(
                  'font-display text-xl md:text-2xl font-bold transition-colors',
                  isScrolled || !isHome ? 'text-primary' : 'text-white'
                )}
              >
                Recanto do Matuto
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative font-medium transition-colors',
                    isScrolled || !isHome
                      ? 'text-text hover:text-primary'
                      : 'text-white/90 hover:text-white',
                    pathname === link.href && 'text-primary'
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <Button
                asChild
                className="hidden md:inline-flex"
                variant={isScrolled || !isHome ? 'primary' : 'secondary'}
                size="sm"
              >
                <Link href="/reservas">Reserve agora</Link>
              </Button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-colors',
                  isScrolled || !isHome
                    ? 'text-text hover:bg-cream-dark'
                    : 'text-white hover:bg-white/10'
                )}
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
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
