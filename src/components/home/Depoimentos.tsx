'use client';

import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import type { Avaliacao } from '@/types/avaliacao';

import 'swiper/css';
import 'swiper/css/pagination';

interface DepoimentosProps {
  avaliacoes: Avaliacao[];
}

export default function Depoimentos({ avaliacoes }: DepoimentosProps) {
  if (avaliacoes.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
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
              <span className="h-px w-10 bg-dark block"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-dark/50">Avaliações</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-dark tracking-tighter leading-[0.9]">
              Palavra de<br />
              <span className="italic text-primary/90 font-medium">Quem Viveu.</span>
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
              A satisfação dos nossos hóspedes é o nosso maior orgulho. Confira algumas
              avaliações de quem já se hospedou conosco.
            </p>
          </motion.div>
        </div>

        {/* Swiper Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={0} /* Brutalist border-to-border approach */
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-16"
          >
            {avaliacoes.map((avaliacao) => (
              <SwiperSlide key={avaliacao.id}>
                <div className="bg-transparent border-t border-b border-dark/10 border-r p-8 md:p-12 h-full flex flex-col group hover:bg-white hover:border-transparent transition-all duration-500 relative">
                  
                  {/* Decorative background noise for hover state */}
                  <div className="absolute inset-0 noise-bg opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 mix-blend-overlay"></div>

                  {/* Quote Icon */}
                  <div className="mb-8 relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                    <Quote className="w-12 h-12 text-dark/5" />
                  </div>

                  {/* Comment */}
                  <p className="text-dark/80 text-lg md:text-xl leading-relaxed mb-8 flex-1 italic relative z-10 line-clamp-4">
                    &ldquo;{avaliacao.comentario}&rdquo;
                  </p>

                  <div className="relative z-10 mt-auto">
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < avaliacao.nota
                              ? 'text-primary fill-primary'
                              : 'text-dark/10'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-dark rounded-none flex items-center justify-center text-white shrink-0 group-hover:bg-primary transition-colors duration-500">
                        <span className="font-display font-bold text-lg">
                          {avaliacao.hospede?.nome?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-display font-bold text-dark text-lg">
                          {avaliacao.hospede?.nome || 'Hóspede'}
                        </p>
                        <p className="text-sm text-dark/50 tracking-wide uppercase font-semibold">
                          {avaliacao.hospede?.cidade || 'Cidade não informada'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
