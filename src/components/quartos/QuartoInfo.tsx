'use client';

import { motion } from 'framer-motion';
import {
  Bath,
  Wifi,
  AirVent,
  Tv,
  Wind,
  Shirt,
  BedDouble,
  Refrigerator,
  Users,
  Maximize2,
  Check,
} from 'lucide-react';
import { Quarto } from '@/types/quarto';
import { formatCategoria } from '@/lib/formatters';
import Badge from '@/components/ui/Badge';

interface QuartoInfoProps {
  quarto: Quarto;
}

const amenidadeIconMap: Record<string, React.ReactNode> = {
  'Banheiro privativo': <Bath className="w-5 h-5" />,
  'Wi-Fi': <Wifi className="w-5 h-5" />,
  'Ar-condicionado': <AirVent className="w-5 h-5" />,
  'TV': <Tv className="w-5 h-5" />,
  'TV Smart': <Tv className="w-5 h-5" />,
  'Ventilador': <Wind className="w-5 h-5" />,
  'Roupão': <Shirt className="w-5 h-5" />,
  'Roupa de cama': <BedDouble className="w-5 h-5" />,
  'Roupa de cama premium': <BedDouble className="w-5 h-5" />,
  'Toalhas': <Shirt className="w-5 h-5" />,
  'Frigobar': <Refrigerator className="w-5 h-5" />,
};

export default function QuartoInfo({ quarto }: QuartoInfoProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="primary">{formatCategoria(quarto.categoria)}</Badge>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-dark mb-4 drop-shadow-sm">
          {quarto.nome}
        </h1>
        <div className="flex items-center gap-6 text-text-light">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
            <Users className="w-5 h-5" />
            <span>Até {quarto.capacidade} pessoas</span>
          </div>
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
            <Maximize2 className="w-5 h-5" />
            <span>{quarto.tamanho_m2}m²</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="font-display text-xl font-black uppercase tracking-widest text-dark mb-3 border-b border-dark/10 pb-4">
          Sobre o quarto
        </h2>
        <p className="text-text-light leading-relaxed">{quarto.descricao}</p>
      </div>

      {/* Amenidades */}
      <div>
        <h2 className="font-display text-xl font-black uppercase tracking-widest text-dark mb-4 border-b border-dark/10 pb-4">
          O que o quarto oferece
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quarto.amenidades.map((amenidade, index) => (
            <motion.div
              key={amenidade}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-3 text-text"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center text-primary">
                {amenidadeIconMap[amenidade] || <Check className="w-5 h-5" />}
              </div>
              <span className="font-bold text-xs uppercase tracking-widest">{amenidade}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Regras */}
      <div>
        <h2 className="font-display text-xl font-black uppercase tracking-widest text-dark mb-4 border-b border-dark/10 pb-4">
          Regras e informações
        </h2>
        <ul className="space-y-3">
          {[
            'Check-in a partir das 14h',
            'Check-out até às 12h',
            'Proibido fumar no quarto',
            'Animais de estimação sob consulta',
            'Silêncio após as 22h',
          ].map((regra, index) => (
            <li key={index} className="flex items-start gap-3 text-text-light">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>{regra}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
