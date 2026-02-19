 'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Car, Bus, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function Localizacao() {
  return (
    <section className="bg-dark py-20 dark-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Como <span className="text-secondary">chegar</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Estamos localizados em Piranhas, Alagoas, a poucos minutos do Canyon do Xingó.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl shadow-black/30 border border-white/10">
              <iframe
                src={SITE_CONFIG.mapsEmbedLink}
                className="w-full h-full"
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
                className="absolute top-3 right-3 z-10 inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary text-dark px-3 py-2 text-sm font-semibold shadow-lg shadow-black/25 hover:bg-secondary-light transition-colors sm:top-4 sm:right-4 sm:gap-2 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base sm:font-bold"
                aria-label="Abrir localização no Google Maps"
              >
                <MapPin className="w-5 h-5" />
                <span className="sm:hidden">Abrir Maps</span>
                <span className="hidden sm:inline">Abrir no Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Location Badge */}
            <div className="absolute -bottom-3 left-4 bg-secondary text-dark px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 sm:-bottom-4 sm:px-4 sm:py-2 sm:rounded-xl">
              <MapPin className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-semibold">Piranhas, Alagoas</span>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* How to get there */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="font-display text-xl font-semibold text-white">
                Como chegar
              </h3>

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
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
