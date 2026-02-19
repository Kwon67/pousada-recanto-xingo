'use client';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?auto=format&fit=crop&w=1920&q=80';

const HERO_PHOTO_OVERLAY =
  'linear-gradient(to right, rgba(19,24,33,0.95) 0%, rgba(19,24,33,0.4) 50%, rgba(19,24,33,0.9) 100%)';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

interface HeroProps {
  backgroundImageUrl?: string;
  logoUrl?: string;
}

export default function Hero({ backgroundImageUrl, logoUrl }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const logoScale = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.92, 0.84]);

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative' }}
      className="noise-bg flex min-h-svh items-center bg-[#1B3A4B] pt-20"
    >
      {/* Subtle bottom fade to blend with check-in container */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/20 to-transparent pointer-events-none z-20" />
      {/* — Background — */}
      <motion.div className="absolute inset-0 z-0">
        <div
          className="hero-bg-photo absolute inset-0"
          style={heroBackgroundStyle}
        />
      </motion.div>

      {/* Decorative Text (Background layer) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0 overflow-hidden">
        <h2 className="text-[40vw] font-black uppercase tracking-tighter leading-none select-none">
          RECANTO
        </h2>
      </div>

      <div className="container relative mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end gap-12 lg:gap-0">
          
          {/* LEFT: Massive Typography & CTA */}
          <div className="relative z-10 w-full lg:w-2/3 flex flex-col items-start text-left">
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-3 rounded-none border-l-2 border-secondary bg-white/5 backdrop-blur-md px-4 py-2 text-[10px] font-bold tracking-[0.3em] text-secondary uppercase"
            >
              Piranhas · Alagoas
            </motion.div>

            <motion.div className="relative">
              <h1 className="sr-only">Pousada Recanto do Matuto</h1>
              <div className="flex flex-col">
                <motion.span 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] font-black text-white tracking-tighter italic"
                >
                  CONFORTO
                </motion.span>
                <motion.span 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] font-black text-secondary tracking-tighter pl-[10vw]"
                >
                  AUTÊNTICO
                </motion.span>
              </div>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 max-w-lg text-lg leading-[1.6] text-white/70 font-light"
            >
              Experiência exclusiva às margens do Canyon do Xingó. Onde o rústico abraça o luxo.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <Link href="/reservas">
                <Button
                  size="lg"
                  variant="luxury"
                  className="group rounded-none h-16 px-10 text-lg uppercase tracking-widest"
                >
                  Reservar Agora
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
              <Link href="/quartos">
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-none h-16 text-white hover:bg-white/10 text-lg uppercase tracking-widest"
                >
                  Explorar Suítes
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Floating Asymmetric Logo - Luxury Seal Restored */}
          <div className="relative z-60 w-full lg:w-1/3 flex justify-end">
            <motion.div
              style={prefersReducedMotion ? { y: -24 } : { scale: logoScale, y: -24 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-60 group"
            >
              {/* Outer glow/halo */}
              <div className="absolute inset-0 bg-secondary/30 blur-[60px] rounded-full scale-125 opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
              
              {/* Main Logo Container - More Compact Size */}
              <div className="relative h-40 w-40 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 rounded-full border-[3px] border-secondary/60 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(212,168,67,0.2)] overflow-hidden ring-4 ring-white/5 bg-white flex items-center justify-center">
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt="Logo Pousada"
                    fill
                    priority
                    className="object-cover rounded-full transition-transform duration-[2s] group-hover:scale-110"
                  />
                )}
                {/* Subtle glass reflection overlay */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
                
                {/* Dynamic light reflection sweep */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>

              {/* Decorative orbiting ring - Adjusted size */}
              <div className="absolute -inset-4 border border-secondary/15 rounded-full animate-[spin_35s_linear_infinite] pointer-events-none" />
              
              {/* Vertical side text - Adjusted position */}
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 rotate-90 origin-center whitespace-nowrap">
                <span className="text-[9px] font-bold tracking-[0.8em] text-white/15 uppercase">
                  EST. 2024
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Modern Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-6 flex items-center gap-4"
      >
        <div className="w-px h-12 bg-linear-to-b from-secondary to-transparent" />
        <span className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase vertical-text">
          Desça para explorar
        </span>
      </motion.div>
    </section>
  );
}
