'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants';
import Button from '@/components/ui/Button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    scrollPositionRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';

      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollPositionRef.current);

      requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-cream-dark">
                <span className="font-display text-xl font-bold text-primary">
                  Recanto do Matuto
                </span>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-cream-dark transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6 text-text" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6">
                <ul className="space-y-2">
                  {NAV_LINKS.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'block py-3 px-4 rounded-xl font-medium text-lg transition-colors',
                          pathname === link.href
                            ? 'bg-primary/10 text-primary'
                            : 'text-text hover:bg-cream-dark'
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                  <Link href="/reservas" onClick={onClose}>
                    <Button fullWidth size="lg">
                      Reserve agora
                    </Button>
                  </Link>
                </motion.div>
              </nav>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-cream border-t border-cream-dark"
              >
                <p className="text-sm text-text-light mb-4">Entre em contato</p>
                <div className="space-y-3">
                  <a
                    href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 text-text hover:text-primary transition-colors"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{SITE_CONFIG.phone}</span>
                  </a>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="flex items-center gap-3 text-text hover:text-primary transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="truncate">{SITE_CONFIG.email}</span>
                  </a>
                  <a
                    href={`https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text hover:text-primary transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-primary" />
                    <span>{SITE_CONFIG.instagram}</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
