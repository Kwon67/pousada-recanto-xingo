'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';

export default function CTAReserva() {
  return (
    <section className="relative overflow-hidden bg-dark py-24 dark-dots">
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-secondary px-4 py-2 rounded-full mb-6"
          >
            <span className="font-medium">Reserve com antecedência</span>
          </motion.div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Reserve agora e viva essa{' '}
            <span className="text-secondary">experiência</span>
          </h2>

          {/* Subtitle */}
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Garanta sua estadia no Recanto do Matuto e descubra as belezas do Canyon do
            Xingó. Quartos aconchegantes, hospitalidade nordestina e paisagens inesquecíveis.
          </p>

          {/* Price */}
          <div className="mb-10">
            <p className="text-white/60 text-sm mb-1">Diárias a partir de</p>
            <p className="font-display text-4xl md:text-5xl font-bold text-secondary">
              {formatCurrency(180)}
              <span className="text-lg font-normal text-white/60">/noite</span>
            </p>
          </div>

          {/* CTA Button */}
          <Link href="/reservas">
            <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Fazer minha reserva
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
