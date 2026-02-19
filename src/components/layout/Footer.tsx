'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Instagram, MessageCircle, Clock } from 'lucide-react';
import { SITE_CONFIG, NAV_LINKS } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="footer-surface text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 footer-inner">
        <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h3 className="font-display text-2xl font-bold text-secondary">
                Recanto do Matuto
              </h3>
            </Link>
            <p className="text-white/70 leading-relaxed">
              Seu refúgio às margens do Canyon do Xingó. Pousada aconchegante em Piranhas,
              Alagoas, com hospitalidade nordestina.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a
                href={`https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link w-10 h-10 rounded-full flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link w-10 h-10 rounded-full flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading font-display text-lg font-semibold mb-6 text-white">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/reservas"
                  className="footer-link"
                >
                  Reservas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading font-display text-lg font-semibold mb-6 text-white">
              Contato
            </h4>
            <ul className="space-y-4 footer-contact">
              <li>
                <a
                  href={SITE_CONFIG.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-secondary" />
                  <span>{SITE_CONFIG.address}</span>
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppLink(SITE_CONFIG.phoneClean)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-center gap-3"
                >
                  <Phone className="w-5 h-5 shrink-0 text-secondary" />
                  <span>{SITE_CONFIG.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="footer-link flex items-center gap-3"
                >
                  <Mail className="w-5 h-5 shrink-0 text-secondary" />
                  <span className="truncate">{SITE_CONFIG.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="footer-heading font-display text-lg font-semibold mb-6 text-white">
              Horários
            </h4>
            <ul className="space-y-4 footer-hours">
              <li className="flex items-start gap-3 text-white/70">
                <Clock className="w-5 h-5 mt-0.5 shrink-0 text-secondary" />
                <div>
                  <p className="font-medium text-white">Check-in</p>
                  <p>A partir das {SITE_CONFIG.checkIn}</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <Clock className="w-5 h-5 mt-0.5 shrink-0 text-secondary" />
                <div>
                  <p className="font-medium text-white">Check-out</p>
                  <p>Até às {SITE_CONFIG.checkOut}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 footer-bottom">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>
              © {SITE_CONFIG.year} {SITE_CONFIG.name}. Todos os direitos reservados.
            </p>
            <p>
              Desenvolvido por{' '}
              <a
                href="https://kivora.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                {SITE_CONFIG.developer}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
