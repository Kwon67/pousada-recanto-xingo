'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuartos } from '@/hooks/useQuartos';
import { formatCurrency, formatCategoria } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ArrowUpRight } from 'lucide-react';

export default function QuartosDestaque() {
  const { quartosDestaque, loading } = useQuartos();

  return (
    <section className="py-24 md:py-32 bg-[#0A161E] relative overflow-hidden">
      {/* Noise background overlay */}
      <div className="absolute inset-0 noise-bg opacity-30 mix-blend-overlay pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header - Asymmetric Left */}
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
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Acomodações</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Quartos<br />
              <span className="italic text-secondary/90 font-medium">Singulares.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:text-right"
          >
            <p className="text-white/60 text-lg mb-6 max-w-sm md:ml-auto">
              Conforto absoluto projetado para amplificar a sua paz no sertão de Piranhas.
            </p>
            <Button asChild variant="luxury" className="rounded-none uppercase tracking-widest text-xs font-bold">
              <Link href="/quartos">
                Ver todos os quartos
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Masonry / Staggered Layout for Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : quartosDestaque.map((quarto, index) => {
                
                // Add a staggered vertical offset for the middle item on desktop to create asymmetry
                const isMiddle = index % 3 === 1;
                const marginTopClass = isMiddle ? "lg:mt-16" : "";

                return (
                  <motion.div
                    key={quarto.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: index * 0.15 }}
                    className={marginTopClass}
                  >
                    <Link href={`/quartos/${quarto.slug}`} className="block group">
                      <div className="relative aspect-3/4 overflow-hidden bg-black/50">
                        {/* Image */}
                        {quarto.imagem_principal ? (
                          <Image
                            src={quarto.imagem_principal}
                            alt={quarto.nome}
                            fill
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#050A0F] flex items-center justify-center text-white/40 text-sm font-display tracking-widest uppercase">
                            Sem Imagem
                          </div>
                        )}
                        
                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-80" />

                        {/* Top Category Badge */}
                        <div className="absolute top-6 left-6 border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest text-white/90">
                          {formatCategoria(quarto.categoria)}
                        </div>

                        {/* Bottom Content Area */}
                        <div className="absolute bottom-6 left-6 right-6">
                          <h3 className="font-display text-2xl font-semibold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-1">
                            {quarto.nome}
                          </h3>
                          <div className="flex items-center justify-between border-t border-white/20 pt-4 overflow-hidden">
                            <span className="text-white/60 text-xs tracking-widest uppercase transform transition-transform duration-500 group-hover:-translate-y-1 block">
                              Até {quarto.capacidade} pax
                            </span>
                            <span className="text-secondary font-bold text-sm tracking-widest transform transition-transform duration-500 group-hover:-translate-y-1 block">
                              {formatCurrency(quarto.preco_diaria)} / Noite
                            </span>
                          </div>
                        </div>

                        {/* Hover Overlay Reveal Icon */}
                        <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                          <div className="w-16 h-16 rounded-full border border-secondary/50 flex items-center justify-center bg-black/20 backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
                            <ArrowUpRight className="w-6 h-6 text-secondary" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
