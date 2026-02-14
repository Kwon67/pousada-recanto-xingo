'use client';

import { motion } from 'framer-motion';
import { Users, Check } from 'lucide-react';
import { Quarto } from '@/types/quarto';
import { formatCurrency, formatCategoria } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface SeletorQuartoProps {
  quartos: Quarto[];
  selectedId: string | null;
  onSelect: (quarto: Quarto) => void;
}

export default function SeletorQuarto({ quartos, selectedId, onSelect }: SeletorQuartoProps) {
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
            <button
              type="button"
              onClick={() => onSelect(quarto)}
              className={cn(
                'w-full text-left bg-white rounded-2xl shadow-lg shadow-dark/5 overflow-hidden transition-all duration-300',
                isSelected
                  ? 'ring-2 ring-primary shadow-xl'
                  : 'hover:shadow-xl hover:-translate-y-1'
              )}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-48 h-48 md:h-auto relative shrink-0">
                  <img
                    src={quarto.imagem_principal}
                    alt={quarto.nome}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
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
                      <h3 className="font-display text-xl font-semibold text-dark mb-2">
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

                    <div className="text-right md:shrink-0">
                      <p className="text-xs text-text-light">a partir de</p>
                      <p className="font-display text-2xl font-bold text-primary">
                        {formatCurrency(quarto.preco_diaria)}
                      </p>
                      <p className="text-xs text-text-light">/noite</p>
                    </div>
                  </div>

                  {/* Amenidades Preview */}
                  <div className="mt-4 pt-4 border-t border-cream-dark">
                    <p className="text-xs text-text-light line-clamp-1">
                      {quarto.amenidades.slice(0, 5).join(' • ')}
                      {quarto.amenidades.length > 5 && ` + ${quarto.amenidades.length - 5} mais`}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
