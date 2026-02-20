'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Check } from 'lucide-react';
import { Quarto } from '@/types/quarto';
import { formatCurrency, formatCategoria } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface SeletorQuartoProps {
  quartos: Quarto[];
  selectedId: string | null;
  onSelect: (_quarto: Quarto) => void;
  onContinue?: () => void;
}

export default function SeletorQuarto({ quartos, selectedId, onSelect, onContinue }: SeletorQuartoProps) {
  if (quartos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">
          Nenhum quarto disponível para as datas selecionadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quartos.map((quarto, index) => {
        const isSelected = selectedId === quarto.id;

        return (
          <motion.div
            key={quarto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(quarto)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(quarto);
                }
              }}
              className={cn(
                'w-full text-left bg-white rounded-none border border-dark/10 transition-all duration-300 relative group overflow-hidden cursor-pointer outline-none',
                isSelected
                  ? 'ring-2 ring-dark bg-cream/30'
                  : 'hover:border-dark/30 hover:bg-cream/10 focus-visible:ring-2 focus-visible:ring-dark/50'
              )}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-48 h-48 md:h-auto relative shrink-0">
                  {quarto.imagem_principal ? (
                    <Image
                      src={quarto.imagem_principal}
                      alt={quarto.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  ) : (
                    <div className="w-full h-full bg-cream flex items-center justify-center">
                      <span className="text-dark/30 font-bold tracking-widest uppercase text-xs">Sem foto</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-dark rounded-none flex items-center justify-center">
                       <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={isSelected ? 'primary' : 'secondary'} size="sm">
                          {formatCategoria(quarto.categoria)}
                        </Badge>
                      </div>
                      <h3 className="font-display text-2xl font-black uppercase tracking-tight text-dark mb-2">
                        {quarto.nome}
                      </h3>
                      <p className="text-text-light text-sm mb-3 line-clamp-2">
                        {quarto.descricao_curta}
                      </p>
                      <div className="flex items-center gap-4 text-text-light text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Até {quarto.capacidade} pessoas</span>
                        </div>
                        <span>{quarto.tamanho_m2}m²</span>
                      </div>
                    </div>

                    <div className="text-right md:shrink-0 flex flex-col justify-end h-full">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-dark/40">Tarifa média</p>
                      <p className="font-display text-3xl font-black tracking-tighter text-dark">
                        {formatCurrency(quarto.preco_diaria)}
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-dark/40">/ noite</p>
                    </div>
                  </div>

                  {/* Amenidades Preview */}
                  <div className="mt-6 pt-4 border-t border-dark/10">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-dark/60 line-clamp-1">
                      {quarto.amenidades.slice(0, 5).join(' · ')}
                      {quarto.amenidades.length > 5 && ` + ${quarto.amenidades.length - 5}`}
                    </p>
                  </div>

                  {/* Inline Continue Button */}
                  {isSelected && onContinue && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-dark/10"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContinue();
                        }}
                        className="w-full bg-dark text-white rounded-none py-4 px-6 font-bold uppercase tracking-widest text-sm hover:bg-dark-light transition-colors flex items-center justify-center gap-2"
                      >
                        Confirmar Quarto e Continuar
                        <Check className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
