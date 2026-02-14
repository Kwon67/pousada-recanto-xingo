'use client';

import { motion } from 'framer-motion';
import { Ship, Mountain, Landmark, Map, UtensilsCrossed, Sunset } from 'lucide-react';
import { experienciasMock } from '@/data/mock';

const iconMap: Record<string, React.ReactNode> = {
  Ship: <Ship className="w-6 h-6" />,
  Mountain: <Mountain className="w-6 h-6" />,
  Landmark: <Landmark className="w-6 h-6" />,
  Map: <Map className="w-6 h-6" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6" />,
  Sunset: <Sunset className="w-6 h-6" />,
};

export default function Experiencias() {
  return (
    <section className="py-20 bg-cream noise-bg">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark mb-4">
            Explore o <span className="text-primary">Canyon do Xingó</span>
          </h2>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            Descubra as experiências únicas que a região oferece. De passeios de catamarã a
            trilhas com vistas deslumbrantes, o Xingó tem muito a oferecer.
          </p>
        </motion.div>

        {/* Experiencias Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experienciasMock.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300 h-full hover:border-primary/20">
                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {iconMap[exp.icone]}
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-dark mb-3 group-hover:text-primary transition-colors">
                  {exp.titulo}
                </h3>
                <p className="text-text-light text-sm leading-relaxed">
                  {exp.descricao}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
