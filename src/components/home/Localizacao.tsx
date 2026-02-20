 'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Car, Bus, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function Localizacao() {
  return (
    <section className="bg-[#0A161E] py-24 md:py-32 relative overflow-hidden">
      {/* Background noise */}
      <div className="absolute inset-0 noise-bg opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Brutalist Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-secondary block"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Rotas</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Como<br />
              <span className="italic text-secondary/90 font-medium">Chegar.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:text-right"
          >
            <p className="text-white/60 text-lg max-w-sm md:ml-auto">
              Estamos localizados em Piranhas, Alagoas, a poucos minutos do majestoso Canyon do Xingó.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start relative z-10">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Sharp geometry container */}
            <div className="relative aspect-video md:aspect-4/3 rounded-none overflow-hidden border border-white/20 bg-black">
              <iframe
                src={SITE_CONFIG.mapsEmbedLink}
                className="w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Pousada"
              />
              <a
                href={SITE_CONFIG.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 z-10 inline-flex items-center justify-center gap-2 rounded-none bg-secondary text-dark px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors border border-transparent hover:border-dark"
                aria-label="Abrir localização no Google Maps"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Abrir no Maps</span>
                <span className="sm:hidden">Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Brutalist Location Badge */}
            <div className="absolute -bottom-4 left-6 bg-dark border border-white/20 text-white px-4 py-2 rounded-none flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="text-xs uppercase tracking-widest font-bold">Piranhas, AL</span>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 pt-8 lg:pt-0"
          >
            {/* How to get there */}
            <div className="bg-transparent border-t border-b border-white/10 p-6 md:p-10 space-y-8">
              <h3 className="font-display text-2xl font-bold text-white uppercase tracking-wider">
                Rotas de Acesso
              </h3>

              <div className="space-y-6">
                {[
                  {
                    icon: <Plane className="w-5 h-5" />,
                    title: 'De avião',
                    desc: 'Aeroportos de Maceió (AL) ou Aracaju (SE).',
                  },
                  {
                    icon: <Car className="w-5 h-5" />,
                    title: 'De carro',
                    desc: 'Acesso principal pelas rodovias BR-101 e AL-225.',
                  },
                  {
                    icon: <Bus className="w-5 h-5" />,
                    title: 'De ônibus',
                    desc: 'Linhas regionais com destino a Piranhas.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-secondary group-hover:text-dark group-hover:border-secondary transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1 group-hover:text-secondary transition-colors duration-300">{item.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
