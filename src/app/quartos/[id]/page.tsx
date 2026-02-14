'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useQuarto, useQuartos } from '@/hooks/useQuartos';
import QuartoGaleria from '@/components/quartos/QuartoGaleria';
import QuartoInfo from '@/components/quartos/QuartoInfo';
import QuartoPreco from '@/components/quartos/QuartoPreco';
import QuartoCard from '@/components/quartos/QuartoCard';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';

interface QuartoPageProps {
  params: Promise<{ id: string }>;
}

export default function QuartoPage({ params }: QuartoPageProps) {
  const { id } = use(params);
  const { quarto, loading, error } = useQuarto(id);
  const { allQuartos } = useQuartos();

  // Get related quartos (excluding current one)
  const quartosRelacionados = allQuartos
    .filter((q) => q.slug !== id)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="pt-24 pb-20 bg-cream min-h-screen">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-[16/10] rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32" />
            </div>
            <div>
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quarto) {
    return (
      <div className="pt-24 pb-20 bg-cream min-h-screen">
        <div className="container mx-auto px-4 text-center py-20">
          <h1 className="font-display text-3xl font-bold text-dark mb-4">
            Quarto não encontrado
          </h1>
          <p className="text-text-light mb-8">
            O quarto que você está procurando não existe ou foi removido.
          </p>
          <Link href="/quartos">
            <Button leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Ver todos os quartos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen noise-bg">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-text-light mb-8"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/quartos" className="hover:text-primary transition-colors">
            Quartos
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark font-medium">{quarto.nome}</span>
        </motion.nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Gallery & Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            <QuartoGaleria imagens={quarto.imagens} nome={quarto.nome} />
            <QuartoInfo quarto={quarto} />
          </motion.div>

          {/* Right Column - Price Card */}
          <div className="lg:col-span-1">
            <QuartoPreco quarto={quarto} />
          </div>
        </div>

        {/* Related Quartos */}
        {quartosRelacionados.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold text-dark mb-8">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quartosRelacionados.map((q, index) => (
                <QuartoCard key={q.id} quarto={q} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
