'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const unlockBody = () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };

    if (!isOpen) {
      unlockBody();
      return;
    }

    scrollPositionRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      unlockBody();
      window.scrollTo({ top: scrollPositionRef.current, left: 0, behavior: 'auto' });
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

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
            className="fixed inset-0 bg-[#0A161E]/80 backdrop-blur-md z-100 lg:hidden"
          />

          {/* Menu Panel - Brutalist */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-cream z-100 lg:hidden border-l border-dark/10"
          >
            <div className="flex flex-col h-full relative">
              
              {/* Subtle noise in the mobile menu */}
              <div className="absolute inset-0 noise-bg opacity-40 mix-blend-overlay pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark/10 relative z-10">
                <span className="font-display text-xl font-black uppercase tracking-widest text-dark">
                  Recanto <span className="text-primary">Matuto</span>
                </span>
                <button
                  onClick={onClose}
                  className="p-2 rounded-none border border-transparent hover:border-dark/20 hover:bg-white transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6 text-dark" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-6 py-8 relative z-10">
                <ul className="space-y-0 border-t border-dark/10">
                  {NAV_LINKS.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-dark/10"
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'block py-5 font-bold text-sm tracking-[0.2em] uppercase transition-all',
                          pathname === link.href
                            ? 'text-primary pl-4 border-l-2 border-primary bg-white'
                            : 'text-dark/70 hover:text-dark hover:pl-4 hover:bg-white'
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
                  className="mt-12"
                >
                  <Link href="/reservas" onClick={onClose} className="block w-full">
                    <Button 
                      className="w-full h-[60px] rounded-none bg-dark text-white uppercase tracking-widest text-sm font-bold border border-dark hover:bg-white hover:text-dark"
                    >
                      Reservar Agora
                    </Button>
                  </Link>
                </motion.div>
              </nav>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-white border-t border-dark/10 relative z-10"
              >
                <p className="text-xs tracking-widest uppercase font-bold text-dark/40 mb-6">Contatos</p>
                <div className="space-y-4">
                  <a
                    href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-4 text-dark/80 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <div className="w-10 h-10 border border-dark/10 flex items-center justify-center bg-cream">
                      <Phone className="w-4 h-4 text-dark" />
                    </div>
                    <span>{SITE_CONFIG.phone}</span>
                  </a>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="flex items-center gap-4 text-dark/80 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <div className="w-10 h-10 border border-dark/10 flex items-center justify-center bg-cream">
                      <Mail className="w-4 h-4 text-dark" />
                    </div>
                    <span className="truncate">{SITE_CONFIG.email}</span>
                  </a>
                  <a
                    href={`https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-dark/80 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <div className="w-10 h-10 border border-dark/10 flex items-center justify-center bg-cream">
                      <Instagram className="w-4 h-4 text-dark" />
                    </div>
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
