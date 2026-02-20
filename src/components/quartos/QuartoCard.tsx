'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Maximize2 } from 'lucide-react';
import { Quarto } from '@/types/quarto';
import { formatCurrency, formatCategoria } from '@/lib/formatters';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/app-button';
import Image from 'next/image';

interface QuartoCardProps {
  quarto: Quarto;
  index?: number;
}

export default function QuartoCard({ quarto, index = 0 }: QuartoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="bg-white rounded-none border border-dark/10 overflow-hidden card-hover group h-full flex flex-col">
        {/* Image */}
        <Link href={`/quartos/${quarto.slug}`} className="relative aspect-[4/3] overflow-hidden block">
          <Image
            src={quarto.imagem_principal}
            alt={quarto.nome}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="dark">{formatCategoria(quarto.categoria)}</Badge>
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <Link href={`/quartos/${quarto.slug}`}>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-dark mb-2 group-hover:text-primary transition-colors">
              {quarto.nome}
            </h3>
          </Link>
          <p className="text-text-light text-sm mb-4 line-clamp-2 flex-1">
            {quarto.descricao_curta}
          </p>

          {/* Icons Row */}
          <div className="flex items-center gap-4 mb-4 text-text-light text-sm">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]">
              <Users className="w-4 h-4" />
              <span>Até {quarto.capacidade}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]">
              <Maximize2 className="w-4 h-4" />
              <span>{quarto.tamanho_m2}m²</span>
            </div>
          </div>

          {/* Price & Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-cream-dark">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-dark/40">a partir de</p>
              <p className="font-display text-3xl font-black tracking-tighter text-dark">
                {formatCurrency(quarto.preco_diaria)}
                <span className="text-[10px] uppercase font-bold tracking-widest text-dark/40 ml-1">/noite</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/quartos/${quarto.slug}`}>
                <Button variant="outline" size="sm">
                  Ver detalhes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
