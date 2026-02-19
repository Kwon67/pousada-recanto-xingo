'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, TreePine, Waves, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

const highlights = [
  { icon: <Waves className="h-4 w-4" />, label: 'Vista para o Xingó' },
  { icon: <TreePine className="h-4 w-4" />, label: 'Natureza preservada' },
  { icon: <Sun className="h-4 w-4" />, label: 'Sol o ano todo' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

function FloatingParticle({
  size,
  x,
  y,
  delay,
  duration,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-secondary/20"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -18, 0],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden
    />
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.35], [0, -60]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={ref}
      className="noise-bg relative flex min-h-dvh max-h-[1080px] items-center overflow-hidden bg-dark pt-28 pb-20 sm:pt-32 sm:pb-24 md:pt-24 md:pb-16"
    >
      {/* — Background layers — */}
      <motion.div
        style={{ y: bgY, willChange: 'transform' }}
        className="absolute inset-0"
        aria-hidden
      >
        {/* Base gradient with golden horizon light */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 120% 60% at 20% 110%, rgba(212,168,67,0.18) 0%, transparent 55%)',
              'radial-gradient(ellipse 100% 80% at 90% 0%, rgba(45,106,79,0.14) 0%, transparent 50%)',
              'radial-gradient(ellipse 80% 50% at 70% 90%, rgba(224,122,95,0.08) 0%, transparent 50%)',
              'linear-gradient(155deg, #162e3d 0%, #1b3a4b 35%, #1a3545 65%, #132832 100%)',
            ].join(', '),
          }}
        />

        {/* Subtle diagonal light streak */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background:
              'linear-gradient(135deg, transparent 30%, rgba(212,168,67,0.4) 50%, transparent 70%)',
          }}
        />

        {/* Floating particles (reduced for performance) */}
        <FloatingParticle size={4} x="15%" y="25%" delay={0} duration={5.5} />
        <FloatingParticle size={3} x="78%" y="18%" delay={1.2} duration={6.2} />
        <FloatingParticle size={5} x="55%" y="65%" delay={0.8} duration={7} />
        <FloatingParticle size={3} x="88%" y="55%" delay={2} duration={5.8} />
      </motion.div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(0,0,0,0.35) 100%)',
        }}
        aria-hidden
      />

      {/* — Content — */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY, willChange: 'transform, opacity' }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="mx-auto max-w-6xl lg:flex lg:items-center lg:gap-16">
          {/* Left content — asymmetric 65% */}
          <div className="flex-1 text-center lg:text-left">
            {/* Location badge */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/20 px-5 py-2.5 text-[10px] font-semibold tracking-[0.24em] text-white/85 uppercase backdrop-blur-md ring-1 ring-inset ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.28)]"
            >
              <span
                className="block h-2 w-2 rounded-full bg-secondary shadow-[0_0_12px_rgba(212,168,67,0.75)]"
                aria-hidden
              />
              Piranhas · Alagoas
            </motion.div>

            {/* Title with accent line */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.7, delay: 0.22 }}
              className="relative"
            >
              {/* Gold accent line — visible only on desktop, left-aligned */}
              <div
                className="absolute -left-8 top-2 hidden h-[calc(100%-16px)] w-[3px] rounded-full bg-gradient-to-b from-secondary via-secondary/60 to-transparent lg:block"
                aria-hidden
              />

              <h1 className="font-display text-[2.6rem] leading-[1.04] font-semibold text-white sm:text-6xl md:text-7xl lg:text-[5.2rem]">
                Seu refúgio
                <span className="block text-secondary">no Xingó</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.38 }}
              className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/60 lg:mx-0 md:text-lg"
            >
              Conforto, natureza e hospitalidade em Piranhas, a minutos dos
              cânions do Xingó e do Rio São Francisco.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.55, delay: 0.5 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link href="/reservas">
                <Button size="lg" variant="secondary" className="min-w-52">
                  Reservar agora
                </Button>
              </Link>
              <Link href="/quartos">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-52 border-white/25 text-white hover:border-white/45 hover:bg-white/10"
                >
                  Ver quartos
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right side — highlight cards (asymmetric 35%) */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-14 flex flex-wrap justify-center gap-3 lg:mt-0 lg:w-[320px] lg:shrink-0 lg:flex-col lg:gap-4"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.7 + i * 0.12,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 transition-colors duration-300 hover:border-secondary/30 hover:bg-white/[0.08]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-sm font-medium tracking-wide text-white/75">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* — Scroll indicator — */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium tracking-[0.25em] text-white/35 uppercase">
            Explore
          </span>
          <ChevronDown className="h-4 w-4 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
