'use client';

import { memo, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Sun, TreePine, Waves, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?auto=format&fit=crop&w=1920&q=80';

const HERO_PHOTO_OVERLAY =
  'linear-gradient(120deg, rgba(19,24,33,0.8) 10%, rgba(19,24,33,0.26) 48%, rgba(19,24,33,0.88) 100%)';

const HERO_BASE_GRADIENT = [
  'radial-gradient(ellipse 120% 60% at 20% 110%, rgba(212,168,67,0.18) 0%, transparent 55%)',
  'radial-gradient(ellipse 100% 80% at 90% 0%, rgba(45,106,79,0.14) 0%, transparent 50%)',
  'radial-gradient(ellipse 80% 50% at 70% 90%, rgba(224,122,95,0.08) 0%, transparent 50%)',
  'linear-gradient(155deg, #162e3d 0%, #1b3a4b 35%, #1a3545 65%, #132832 100%)',
].join(', ');

const HERO_STREAK =
  'linear-gradient(135deg, transparent 30%, rgba(212,168,67,0.4) 50%, transparent 70%)';

const HERO_VIGNETTE =
  'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(0,0,0,0.35) 100%)';

const highlightEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const PARTICLES: FloatingParticleProps[] = [
  { size: 4, x: '15%', y: '25%', delay: 0, duration: 5.5 },
  { size: 3, x: '78%', y: '18%', delay: 1.2, duration: 6.2 },
  { size: 5, x: '55%', y: '65%', delay: 0.8, duration: 7 },
  { size: 3, x: '88%', y: '55%', delay: 2, duration: 5.8 },
];

const highlights = [
  { icon: <Waves className="h-4 w-4" />, label: 'Vista para o Xingó' },
  { icon: <TreePine className="h-4 w-4" />, label: 'Natureza preservada' },
  { icon: <Sun className="h-4 w-4" />, label: 'Sol o ano todo' },
];

const FLOATING_PARTICLE_ANIMATE = {
  y: [0, -18, 0],
  opacity: [0.3, 0.7, 0.3],
};

type FloatingParticleProps = {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  isAnimating?: boolean;
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

interface HeroProps {
  backgroundImageUrl?: string;
  logoUrl?: string;
}

const FloatingParticle = memo(function FloatingParticle({
  size,
  x,
  y,
  delay,
  duration,
  isAnimating = true,
}: FloatingParticleProps) {
  const transition = useMemo(
    () => ({
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut" as const,
    }),
    [delay, duration]
  );

  return (
    <motion.div
      className="absolute rounded-full bg-secondary/20"
      style={{ width: size, height: size, left: x, top: y }}
      animate={isAnimating ? FLOATING_PARTICLE_ANIMATE : { y: 0, opacity: 0.3 }}
      transition={isAnimating ? transition : { duration: 0 }}
      aria-hidden
    />
  );
});

export default function Hero({ backgroundImageUrl, logoUrl }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const heroBackgroundImage = useMemo(
    () => backgroundImageUrl?.trim() || FALLBACK_HERO_IMAGE,
    [backgroundImageUrl]
  );

  const heroBackgroundStyle = useMemo(
    () => ({
      backgroundImage: `${HERO_PHOTO_OVERLAY}, url("${heroBackgroundImage}")`,
    }),
    [heroBackgroundImage]
  );

  const heroGradientStyle = useMemo(
    () => ({
      background: HERO_BASE_GRADIENT,
      opacity: 0.72,
    }),
    []
  );

  const heroStreakStyle = useMemo(
    () => ({ background: HERO_STREAK }),
    []
  );

  const highlightTransitions = useMemo(
    () =>
      highlights.map((_, index) => ({
        duration: 0.45,
        delay: 0.7 + index * 0.12,
        ease: highlightEase,
      })),
    []
  );
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.2 });
  const shouldAnimateLoops = isInView && !prefersReducedMotion;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={ref}
      className="noise-bg relative isolate flex min-h-dvh max-h-[1080px] items-center overflow-hidden bg-dark pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-24 md:pb-16"
    >
      {/* — Background layers — */}
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : bgY,
          willChange: 'transform',
        }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div
          className="hero-bg-photo absolute inset-0"
          style={heroBackgroundStyle}
        />

        {/* Base gradient with golden horizon light */}
        <div className="absolute inset-0" style={heroGradientStyle} />

        {/* Subtle diagonal light streak */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={heroStreakStyle}
        />

        {/* Floating particles (reduced for performance) */}
        {PARTICLES.map((particle) => (
          <FloatingParticle
            key={`${particle.x}-${particle.y}`}
            size={particle.size}
            x={particle.x}
            y={particle.y}
            delay={particle.delay}
            duration={particle.duration}
            isAnimating={shouldAnimateLoops}
          />
        ))}
      </motion.div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{ background: HERO_VIGNETTE }}
        aria-hidden
      />

      {/* — Content — */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
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

          {/* Logo Area */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center mb-5"
          >
            <h1 className="sr-only">Pousada Recanto do Matuto - Seu refúgio no Xingó, Piranhas - Alagoas</h1>
            
            {logoUrl ? (
              <div className="relative group">
                {/* Outer glow/halo */}
                <div className="absolute inset-0 bg-secondary/30 blur-[50px] rounded-full scale-110 opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                
                {/* Main Logo Container - Reduced Size */}
                <div className="relative h-44 w-44 sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72 rounded-full border-[3px] border-secondary/60 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(212,168,67,0.2)] overflow-hidden ring-4 ring-white/5 bg-white">
                  <Image
                    src={logoUrl}
                    alt="Logo Pousada Recanto do Matuto"
                    fill
                    sizes="(max-width: 768px) 200px, (max-width: 1200px) 300px, 400px"
                    priority
                    className="object-cover rounded-full group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
                </div>

                {/* Decorative orbiting ring */}
                <div className="absolute -inset-3 border border-secondary/15 rounded-full animate-[spin_25s_linear_infinite] pointer-events-none" />
              </div>
            ) : (
              <div className="font-display text-[clamp(2.4rem,4.5vw,4.8rem)] leading-[1.03] font-semibold tracking-tight text-white">
                Recanto
                <span className="block font-semibold text-secondary/95">do Matuto</span>
              </div>
            )}
          </motion.div>

          {/* Subtitle - Reduced Text Size */}
          <motion.p
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mx-auto mt-4 max-w-xl text-base leading-[1.6] text-white/80 md:text-lg lg:text-xl font-light tracking-wide"
          >
            Conforto, natureza e hospitalidade em Piranhas, a minutos dos
            cânions do Xingó e do Rio São Francisco.
          </motion.p>

          {/* CTAs - More Compact Buttons */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.55, delay: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/reservas">
              <Button
                size="lg"
                variant="luxury"
                className="min-w-56 font-bold"
              >
                Reservar agora
              </Button>
            </Link>
            <Link href="/quartos">
              <Button
                size="lg"
                variant="outline"
                className="min-w-56 border-white/20 text-white bg-white/5 backdrop-blur-sm hover:border-white/50 hover:bg-white/10 transition-all duration-500"
              >
                Conhecer a Pousada
              </Button>
            </Link>
          </motion.div>

          {/* Highlight cards - Reduced spacing and size */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.7, delay: 0.8 }}
            className="relative mt-16 flex flex-wrap justify-center gap-4 lg:gap-6"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20 text-secondary group-hover:scale-110 transition-transform duration-300">
                  {item.icon === highlights[0].icon ? <Waves className="h-4 w-4" /> : 
                   item.icon === highlights[1].icon ? <TreePine className="h-4 w-4" /> : 
                   <Sun className="h-4 w-4" />}
                </span>
                <span className="text-xs font-medium tracking-wide text-white/75">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* — Scroll indicator — */}
      <motion.div
        style={{ opacity: prefersReducedMotion ? 1 : indicatorOpacity }}
        className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 sm:bottom-14"
        aria-hidden
      >
        <motion.div
          animate={shouldAnimateLoops ? { y: [0, 8, 0] } : { y: 0 }}
          transition={shouldAnimateLoops
            ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
            : { duration: 0 }}
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
