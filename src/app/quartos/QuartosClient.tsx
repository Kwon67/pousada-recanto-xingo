'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuartos } from '@/hooks/useQuartos';
import { FiltroQuartos as FiltroType } from '@/types/quarto';
import QuartoCard from '@/components/quartos/QuartoCard';
import FiltroQuartos from '@/components/quartos/FiltroQuartos';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function QuartosClient() {
  const [filtros, setFiltros] = useState<FiltroType>({});
  const { quartos, loading } = useQuartos(filtros);

  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen noise-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-primary font-medium mb-2">Acomodações</p>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Nossos Quartos
          </h1>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            Conheça nossos 10 quartos aconchegantes, todos com banheiro privativo. Escolha o
            ideal para você e sua família.
          </p>
        </motion.div>

        {/* Filtros */}
        <FiltroQuartos filtros={filtros} onFiltroChange={setFiltros} />

        {/* Quartos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : quartos.map((quarto, index) => (
                <QuartoCard key={quarto.id} quarto={quarto} index={index} />
              ))}
        </div>

        {/* Empty State */}
        {!loading && quartos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-text-light text-lg">
              Nenhum quarto encontrado com os filtros selecionados.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
