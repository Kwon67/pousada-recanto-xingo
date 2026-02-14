'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { FiltroQuartos as FiltroType, CategoriaQuarto } from '@/types/quarto';
import { CATEGORIAS_QUARTO, CAPACIDADES } from '@/lib/constants';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface FiltroQuartosProps {
  filtros: FiltroType;
  onFiltroChange: (filtros: FiltroType) => void;
}

export default function FiltroQuartos({ filtros, onFiltroChange }: FiltroQuartosProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoriaChange = (value: string) => {
    onFiltroChange({
      ...filtros,
      categoria: value as CategoriaQuarto | 'todos',
    });
  };

  const handleCapacidadeChange = (value: string) => {
    onFiltroChange({
      ...filtros,
      capacidade: value ? parseInt(value) : undefined,
    });
  };

  const clearFiltros = () => {
    onFiltroChange({});
  };

  const hasFilters = filtros.categoria || filtros.capacidade;

  return (
    <div className="mb-8">
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          fullWidth
        >
          {isOpen ? 'Fechar filtros' : 'Filtrar quartos'}
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'auto' : 0,
          opacity: isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 1 : 0,
        }}
        className="overflow-hidden lg:!h-auto lg:!opacity-100"
      >
        <div className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-6">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-display text-lg font-semibold text-dark">Filtros</h3>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-cream-dark rounded-lg">
              <X className="w-5 h-5 text-text-light" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Categoria */}
            <Select
              label="Categoria"
              options={CATEGORIAS_QUARTO.map((c) => ({ value: c.value, label: c.label }))}
              value={filtros.categoria || 'todos'}
              onChange={(e) => handleCategoriaChange(e.target.value)}
            />

            {/* Capacidade */}
            <Select
              label="Capacidade"
              options={[
                { value: '', label: 'Qualquer' },
                ...CAPACIDADES.map((c) => ({ value: c.value.toString(), label: c.label })),
              ]}
              value={filtros.capacidade?.toString() || ''}
              onChange={(e) => handleCapacidadeChange(e.target.value)}
            />

            {/* Clear Button */}
            {hasFilters && (
              <Button variant="ghost" onClick={clearFiltros} className="text-text-light">
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
