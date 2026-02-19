'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { useQuartos } from '@/hooks/useQuartos';
import { formatCurrency } from '@/lib/formatters';
import { formatCategoria } from '@/lib/formatters';
import Button from '@/components/ui/app-button';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function QuartosDestaque() {
  const { quartosDestaque, loading } = useQuartos();

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
            Nossos Quartos
          </h2>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            10 quartos aconchegantes, todos com banheiro privativo. Escolha o seu e viva uma
            experiência única no sertão alagoano.
          </p>
        </motion.div>

        {/* Quartos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : quartosDestaque.map((quarto, index) => (
                <motion.div
                  key={quarto.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/quartos/${quarto.slug}`} className="block group">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
                      {/* Image */}
                      <div className="relative aspect-4/3 overflow-hidden">
                        {quarto.imagem_principal ? (
                          <Image
                            src={quarto.imagem_principal}
                            alt={quarto.nome}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-cream-dark flex items-center justify-center text-text-light text-sm">
                            Sem imagem
                          </div>
                        )}
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge variant="dark">
                            {formatCategoria(quarto.categoria)}
                          </Badge>
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-display text-xl font-semibold text-dark mb-2 group-hover:text-primary transition-colors">
                          {quarto.nome}
                        </h3>
                        <p className="text-text-light text-sm mb-4 line-clamp-2">
                          {quarto.descricao_curta}
                        </p>

                        {/* Info Row */}
                        <div className="flex items-center justify-between pt-4 border-t border-cream-dark">
                          <div className="flex items-center gap-2 text-text-light">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Até {quarto.capacidade} pessoas</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-text-light">a partir de</p>
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(quarto.preco_diaria)}
                              <span className="text-sm font-normal text-text-light">/noite</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/quartos">
            <Button variant="outline" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Ver todos os quartos
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
