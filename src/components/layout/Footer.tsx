'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Instagram, MessageCircle, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG, NAV_LINKS } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="relative bg-[#0A161E] text-white/80 border-t border-white/10 overflow-hidden pt-20 pb-10">
      {/* Background texture for depth - Brutalist/Minimalist grain */}
      <div className="absolute inset-0 opacity-20 pointer-events-none noise-bg mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Main 70/30 Asymmetric Split */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-8 pb-16">
          
          {/* LEFT COLUMN: 70% - Massive Typography & CTA */}
          <div className="lg:w-[65%] xl:w-[70%] flex flex-col justify-between">
            <div className="mb-12">
              <h2 className="font-display text-4xl sm:text-6xl md:text-7xl xl:text-[8rem] leading-[0.9] text-white font-black tracking-tighter uppercase wrap-break-word hover:text-secondary transition-colors duration-700">
                Recanto<br />
                <span className="text-secondary/90 italic font-medium pr-4">do</span> Matuto.
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 max-w-2xl">
              <p className="text-lg text-white/60 font-medium leading-relaxed max-w-md">
                O seu refúgio exclusivo às margens do Canyon do Xingó. Conforto contemporâneo com alma nordestina em Piranhas, AL.
              </p>
              <div className="flex gap-4 items-center">
                <Button 
                  asChild
                  variant="luxury" 
                  size="lg" 
                  className="rounded-none text-base uppercase tracking-wider font-semibold group h-auto py-4"
                >
                  <Link href="/reservas">
                    Reservar Agora 
                    <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 30% - Contacts and Links (Verticalized, Sharp) */}
          <div className="lg:w-[35%] xl:w-[30%] flex flex-col gap-12 lg:border-l lg:border-white/10 lg:pl-12 pt-4">
            
            {/* Navigation Block */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-semibold">Navegação</h4>
              <ul className="space-y-3 flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-secondary text-lg font-medium transition-colors flex items-center group w-fit"
                    >
                      <span className="h-px w-0 bg-secondary transition-all group-hover:w-4 mr-0 group-hover:mr-3"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Block */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-semibold">Contato Direto</h4>
              <ul className="space-y-5">
                <li>
                  <a
                    href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 items-start hover:text-secondary transition-colors"
                  >
                    <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0 group-hover:border-secondary/50 group-hover:bg-secondary/10 transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-sm text-white/50 mb-1">Central de Reservas</span>
                      <span className="text-lg tracking-wide uppercase font-medium">{SITE_CONFIG.phone}</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONFIG.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 items-start hover:text-white transition-colors"
                  >
                    <div className="w-10 h-10 border border-white/20 rounded-none flex items-center justify-center shrink-0 group-hover:border-white/50 group-hover:bg-white/10 transition-all">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-sm text-white/50 mb-1">Localização</span>
                      <span className="text-base leading-snug font-medium max-w-[200px] block text-white/90">
                        {SITE_CONFIG.address}
                      </span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* BOTTOM BAR: Sharp, Minimalist Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs tracking-wider text-white/40 uppercase font-medium">
            © {SITE_CONFIG.year} {SITE_CONFIG.name}.
          </div>
          
          <div className="flex gap-4">
            <a
              href={`https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-black hover:border-secondary transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-black hover:border-secondary transition-all"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
               href={`mailto:${SITE_CONFIG.email}`}
               className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-black hover:border-secondary transition-all"
               aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs tracking-wider text-white/40 uppercase font-medium flex items-center gap-2">
            <span>By</span>
            <a
              href="https://kivora.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-secondary transition-colors"
            >
              {SITE_CONFIG.developer}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
