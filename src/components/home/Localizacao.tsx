 'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Car, Bus, Navigation } from 'lucide-react';

export default function Localizacao() {
  return (
    <section className="py-20 bg-dark">
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
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31259.68037387799!2d-37.76975!3d-9.6285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7093f47f1c3a4cd%3A0x6fab1d7f45ef3a0!2sPiranhas%2C%20AL!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Pousada"
              />
            </div>

            {/* Location Badge */}
            <div className="absolute -bottom-4 left-4 bg-secondary text-dark px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Piranhas, Alagoas</span>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Address */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                  <Navigation className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    Endereço
                  </h3>
                  <p className="text-white/70">
                    Piranhas, Alagoas<br />
                    Região do Canyon do Xingó
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    A poucos minutos do embarque para o passeio de catamarã
                  </p>
                </div>
              </div>
            </div>

            {/* How to get there */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold text-white">
                Como chegar
              </h3>

              {[
                {
                  icon: <Plane className="w-5 h-5" />,
                  title: 'De avião',
                  desc: 'Aeroporto mais próximo: Maceió (AL) - 280km. Também é possível voar para Aracaju (SE) - 200km.',
                },
                {
                  icon: <Car className="w-5 h-5" />,
                  title: 'De carro',
                  desc: 'Via BR-101 e AL-225. Piranhas fica a 280km de Maceió e 200km de Aracaju.',
                },
                {
                  icon: <Bus className="w-5 h-5" />,
                  title: 'De ônibus',
                  desc: 'Há linhas regulares saindo de Maceió, Aracaju e outras capitais do Nordeste.',
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

            {/* CTA */}
            <a
              href="https://maps.google.com/?q=Piranhas,Alagoas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary-light transition-colors font-medium"
            >
              <MapPin className="w-5 h-5" />
              Ver no Google Maps
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
