'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
  public_id?: string;
};

type SobrePreviewProps = {
  imageUrl?: string;
  media?: MediaItem[];
};

const DEFAULT_SOBRE_IMAGE =
  'https://placehold.co/800x600/2D6A4F/FDF8F0?text=Pousada+Recanto+do+Matuto';

function SobreMediaSlider({
  media,
  fallbackImageUrl,
}: {
  media: MediaItem[];
  fallbackImageUrl?: string;
}) {
  const normalizedMedia = useMemo(
    () => media
      .filter((item): item is MediaItem => (
        Boolean(item)
        && (item.type === 'image' || item.type === 'video')
        && typeof item.url === 'string'
        && item.url.trim().length > 0
      ))
      .map((item) => ({ ...item, url: item.url.trim() })),
    [media]
  );

  const resolvedMedia = useMemo(
    () => (
      normalizedMedia.length > 0
        ? normalizedMedia
        : [{ url: fallbackImageUrl?.trim() || DEFAULT_SOBRE_IMAGE, type: 'image' as const }]
    ),
    [fallbackImageUrl, normalizedMedia]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = resolvedMedia.length;
  const hasMultiple = count > 1;
  const safeActiveIndex = count > 0 ? activeIndex % count : 0;

  const IMAGE_DURATION = 3500;
  const VIDEO_DURATION = 8000;

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasMultiple) return;

    const currentType = resolvedMedia[safeActiveIndex]?.type;
    const delay = currentType === 'video' ? VIDEO_DURATION : IMAGE_DURATION;

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [count, hasMultiple, resolvedMedia, safeActiveIndex]);

  useEffect(() => {
    videoRefs.current.forEach((videoEl, index) => {
      if (index === safeActiveIndex && isVisible) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    });
  }, [isVisible, safeActiveIndex]);

  const goTo = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      goTo((safeActiveIndex + 1) % count);
      return;
    }

    goTo((safeActiveIndex - 1 + count) % count);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-[#050A0F] touch-pan-y overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle overlay over image slider to guarantee text contrast */}
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />

      {resolvedMedia.map((item, i) => {
        const isActive = i === safeActiveIndex;

        if (item.type === 'video') {
          return (
            <video
              key={`sobre-v-${item.url}-${i}`}
              ref={(el) => { if (el) videoRefs.current.set(i, el); }}
              src={item.url}
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
            />
          );
        }

        return (
          <div
            key={`sobre-i-${item.url}-${i}`}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
          >
            <Image
              src={item.url}
              alt={`Pousada Recanto do Matuto ${i + 1}`}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        );
      })}

      {/* Brutalist Pagination Blocks */}
      {hasMultiple && (
        <div className="absolute bottom-6 left-6 z-20 flex gap-2">
          {resolvedMedia.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Mídia ${i + 1}`}
              className={`h-1 transition-all duration-500 ease-out ${
                i === safeActiveIndex
                  ? 'w-12 bg-white'
                  : 'w-4 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SobrePreview({ imageUrl, media = [] }: SobrePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 bg-cream overflow-hidden">
      {/* Background large typography noise */}
      <motion.div 
        style={{ y: y2 }}
        className="absolute top-10 left-[-5%] text-[15rem] leading-none font-display font-black text-dark/5 whitespace-nowrap pointer-events-none select-none z-0 hidden md:block"
      >
        ALMA NORDESTINA
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
          
          {/* LEFT: Text Content Overlapping */}
          <div className="w-full lg:w-[45%] xl:w-[40%] z-20 relative lg:-mr-12 xl:-mr-24 pt-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px w-12 bg-secondary block"></span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-dark/60">Essência</span>
              </div>

              <h2 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.9] font-black text-dark tracking-tighter mb-8 max-w-2xl mix-blend-difference selection:bg-secondary selection:text-dark">
                A Alma<br />
                <span className="italic text-primary/90 font-medium padding-left-2">Sertaneja.</span>
              </h2>

              <div className="bg-white/80 backdrop-blur-md p-8 sm:p-10 border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.03)] relative max-w-xl">
                {/* Decorative sharp corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary -mt-[2px] -mr-[2px]"></div>

                <p className="text-dark/70 text-lg leading-relaxed mb-8 font-medium">
                  Mais que uma hospedagem, um refúgio de paz construído com afeto no coração de Piranhas. 
                  Misturamos o conforto contemporâneo com a bravura e a rica hospitalidade nordestina.
                </p>

                <ul className="space-y-4 mb-10 text-dark/80 font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-secondary block"></span>
                    Atendimento próximo e pessoal
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-secondary block"></span>
                    Localização a minutos do Canyon
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-secondary block"></span>
                    Conforto absoluto no semiárido
                  </li>
                </ul>

                <Button asChild variant="luxury" size="lg" className="rounded-none uppercase tracking-widest text-xs font-bold w-full sm:w-auto h-14">
                  <Link href="/sobre" className="flex items-center justify-center">
                    Nossa História
                    <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Photography Slider */}
          <div className="w-full lg:w-[60%] xl:w-[65%]">
            <motion.div
              style={{ y: y1 }}
              className="relative aspect-4/5 sm:aspect-square lg:aspect-4/3 w-full shadow-[0_40px_80px_rgba(0,0,0,0.15)] group"
            >
              <SobreMediaSlider media={media} fallbackImageUrl={imageUrl} />
              
              {/* Decorative border frame */}
              <div className="absolute -inset-4 border border-dark/10 pointer-events-none hidden md:block transition-transform duration-700 ease-out group-hover:scale-[1.02]"></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
