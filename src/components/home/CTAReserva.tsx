'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTAReserva() {
  return (
    <section className="relative overflow-hidden bg-[#0A161E] py-32 md:py-48 mix-blend-multiply">
      {/* Background Textures */}
      <div className="absolute inset-0 noise-bg mix-blend-overlay opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Top minimal badge */}
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-secondary block"></span>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-secondary">
              Garanta sua Data
            </span>
            <span className="h-px w-8 bg-secondary block"></span>
          </div>

          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
            Viva o <br className="hidden sm:block" />
            <span className="italic text-secondary/90 font-medium">Extraordinário.</span>
          </h2>

          <p className="text-white/60 text-lg sm:text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Reserve agora sua estadia no coração do sertão alagoano e prepare-se para momentos que vão redefinir o seu descanso.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button asChild variant="luxury" size="lg" className="rounded-none uppercase tracking-widest text-sm font-bold w-full sm:w-auto h-16 px-10">
              <Link href="/reservas" className="flex items-center justify-center">
                Reservar Experiência
                <ArrowUpRight className="ml-3 w-5 h-5" />
              </Link>
            </Button>
            <div className="text-white/40 text-sm font-medium tracking-widest uppercase">
              A partir de <span className="text-white font-bold">R$ 380</span> / noite
            </div>
          </motion.div>
        </motion.div>
        
      </div>
    </section>
  );
}
