'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, TreePine, Waves } from 'lucide-react';
import Button from '@/components/ui/Button';

const highlights = [
  { icon: <Waves className="h-4 w-4" />, label: 'Vista para o Xingó' },
  { icon: <TreePine className="h-4 w-4" />, label: 'Natureza preservada' },
  { icon: <Sun className="h-4 w-4" />, label: 'Sol o ano todo' },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.35], [0, -50]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 110]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh max-h-[1000px] items-center overflow-hidden bg-[#0e2430] pt-28 pb-24 sm:pt-32 sm:pb-24 md:pt-24 md:pb-16"
    >
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(140% 90% at 85% 10%, rgba(212,168,67,0.2) 0%, transparent 48%), radial-gradient(95% 90% at 0% 100%, rgba(45,106,79,0.2) 0%, transparent 52%), linear-gradient(120deg, #102c3a 0%, #173846 45%, #0f2a36 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '90px 90px',
            maskImage: 'radial-gradient(circle at center, black 25%, transparent 85%)',
          }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-black/45" aria-hidden />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/8 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/80 uppercase backdrop-blur-sm"
          >
            Piranhas · Alagoas
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.65, delay: 0.2 }}
            className="font-display text-4xl leading-[1.06] text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            A pousada que transforma
            <span className="block text-secondary">sua viagem ao Xingó</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.34 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/72 md:text-lg"
          >
            Experiência intimista, arquitetura acolhedora e conforto na medida certa para dias de descanso com estilo no sertão alagoano.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.55, delay: 0.46 }}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/reservas">
              <Button size="lg" variant="secondary" className="min-w-52">
                Reservar estadia
              </Button>
            </Link>
            <Link href="/quartos">
              <Button
                size="lg"
                variant="outline"
                className="min-w-52 border-white/30 text-white hover:border-white/50 hover:bg-white/12"
              >
                Ver acomodações
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.55, delay: 0.6 }}
            className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/15 pt-5"
          >
            {highlights.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 text-sm tracking-wide text-white/62"
              >
                <span className="text-secondary/90">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
