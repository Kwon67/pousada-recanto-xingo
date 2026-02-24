'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Instagram } from 'lucide-react';
import { cn, getWhatsAppLink } from '@/lib/utils';
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
                    href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-dark/80 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <div className="w-10 h-10 border border-dark/10 flex items-center justify-center bg-cream">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-dark">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span>WhatsApp</span>
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
