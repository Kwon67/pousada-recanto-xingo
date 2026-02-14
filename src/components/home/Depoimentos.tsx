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
    <section className="py-20 bg-cream noise-bg">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark mb-4">
            O que nossos hóspedes dizem
          </h2>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            A satisfação dos nossos hóspedes é o nosso maior orgulho. Confira algumas
            avaliações de quem já se hospedou conosco.
          </p>
        </motion.div>

        {/* Swiper Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {avaliacoes.map((avaliacao) => (
              <SwiperSlide key={avaliacao.id}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 h-full">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-10 h-10 text-primary/20" />
                  </div>

                  {/* Comment */}
                  <p className="text-text-light leading-relaxed mb-6 line-clamp-4">
                    &ldquo;{avaliacao.comentario}&rdquo;
                  </p>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < avaliacao.nota
                            ? 'text-secondary fill-secondary'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-cream-dark">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-display font-bold text-primary text-lg">
                        {avaliacao.hospede?.nome?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-dark">
                        {avaliacao.hospede?.nome || 'Hóspede'}
                      </p>
                      <p className="text-sm text-text-light">
                        {avaliacao.hospede?.cidade || 'Cidade não informada'}
                      </p>
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
