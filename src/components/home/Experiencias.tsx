'use client';

import { motion } from 'framer-motion';
import { Ship, Mountain, Landmark, Map, UtensilsCrossed, Sunset, MoveRight } from 'lucide-react';
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
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-dark block"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-dark/50">Território</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-dark tracking-tighter leading-[0.9]">
              Explore<br />
              <span className="italic text-primary/90 font-medium">O Xingó.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:text-right"
          >
            <p className="text-dark/60 text-lg max-w-sm md:ml-auto">
              Descubra cenários de tirar o fôlego e mergulhe em experiências autênticas.
            </p>
          </motion.div>
        </div>

        {/* Experiencias List Layout (Brutalist Rows) */}
        <div className="border-t border-dark/10">
          {experienciasMock.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group border-b border-dark/10 hover:bg-dark/2 transition-colors duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center py-8 md:py-12 gap-6 md:gap-12 pl-4 pr-4 md:pl-8 lg:pr-12 relative overflow-hidden">
                
                {/* Index Number Background Reveal */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10rem] font-display font-black text-dark/2 pointer-events-none group-hover:text-primary/4 transition-colors duration-500 z-0 select-none">
                  0{index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-white border border-dark/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center justify-center text-dark relative z-10 shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                  {iconMap[exp.icone]}
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10 md:grid md:grid-cols-2 md:gap-12 md:items-center">
                  <h3 className="font-display text-3xl md:text-4xl font-semibold text-dark mb-4 md:mb-0 group-hover:translate-x-4 transition-transform duration-500">
                    {exp.titulo}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <p className="text-dark/60 text-base leading-relaxed max-w-md">
                      {exp.descricao}
                    </p>
                    <div className="hidden md:flex w-12 h-12 rounded-full border border-dark/20 items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <MoveRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
