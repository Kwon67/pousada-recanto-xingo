'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Armchair,
  Bath,
  Droplets,
  Flame,
  Maximize2,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { estruturaMock } from '@/data/mock';

export type MediaItem = {
  url: string;
  type: 'image' | 'video';
  public_id?: string;
};

const iconMap: Record<string, LucideIcon> = {
  Waves,
  Armchair,
  Flame,
  Droplets,
  Maximize2,
  Bath,
};

type EstruturaProps = {
  mediaOverrides?: Record<string, MediaItem[]>;
};

function MediaSlider({ media, alt }: { media: MediaItem[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  const count = media.length;
  const hasMultiple = count > 1;

  const IMAGE_DURATION = 3000;
  const VIDEO_DURATION = 8000;
  const mediaOverlayClass = 'absolute inset-0 bg-dark/62';

  // Observe visibility for video autoplay
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-slide with variable timing per media type
  useEffect(() => {
    if (!hasMultiple) return;

    const scheduleNext = () => {
      const currentType = media[activeIndex]?.type;
      const delay = currentType === 'video' ? VIDEO_DURATION : IMAGE_DURATION;

      timerRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % count);
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasMultiple, count, activeIndex, media]);

  // Play/pause videos based on which slide is active + visibility
  useEffect(() => {
    videoRefs.current.forEach((videoEl, index) => {
      if (index === activeIndex && isVisible) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    });
  }, [activeIndex, isVisible]);

  // Swipe handlers
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
    if (Math.abs(diff) < 50) return; // ignore small drags

    if (diff > 0) {
      // Swipe left → next
      goTo((activeIndex + 1) % count);
    } else {
      // Swipe right → prev
      goTo((activeIndex - 1 + count) % count);
    }
  };

  if (count === 0) return null;

  // Single item — static display
  if (!hasMultiple) {
    const item = media[0];

    if (item.type === 'video') {
      return (
        <div ref={containerRef} className="relative h-52 overflow-hidden bg-dark">
          <video
            ref={(el) => { if (el) videoRefs.current.set(0, el); }}
            src={item.url}
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover opacity-0 transition-opacity duration-500"
            onCanPlay={(e) => {
              e.currentTarget.classList.replace('opacity-0', 'opacity-100');
            }}
          />
          <div className={mediaOverlayClass} />
        </div>
      );
    }

    return (
      <div className="relative h-52 overflow-hidden bg-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-600 group-hover:scale-110"
        />
        <div className={mediaOverlayClass} />
      </div>
    );
  }

  // Multiple items: unified crossfade carousel (images + videos)
  return (
    <div
      ref={containerRef}
      className="relative h-52 overflow-hidden bg-dark touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {media.map((item, i) => {
        const isActive = i === activeIndex;

        if (item.type === 'video') {
          return (
            <video
              key={`v-${item.url}`}
              ref={(el) => { if (el) videoRefs.current.set(i, el); }}
              src={item.url}
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
            />
          );
        }

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.url}
            src={item.url}
            alt={`${alt} ${i + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-600 group-hover:scale-110"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 2 : 1,
              transform: isActive ? 'scale(1)' : 'scale(1.02)',
              transition: 'opacity 700ms ease-in-out, transform 600ms ease-in-out',
            }}
          />
        );
      })}
      <div className={mediaOverlayClass} />

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Mídia ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-4 bg-white/90'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Estrutura({ mediaOverrides }: EstruturaProps) {
  const estruturaItems = estruturaMock.map((item) => {
    const mediaList = mediaOverrides?.[item.id];
    const fallbackMedia: MediaItem[] = [{ url: item.imagem, type: 'image' }];

    return {
      ...item,
      media: mediaList && mediaList.length > 0 ? mediaList : fallbackMedia,
    };
  });

  return (
    <section className="relative overflow-hidden bg-[#050A0F] py-24 lg:py-32 dark-dots">
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-secondary block"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Viver Bem</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Nossa<br />
              <span className="italic text-secondary/90 font-medium">Estrutura.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:text-right"
          >
            <p className="text-white/60 text-lg max-w-sm md:ml-auto">
              Cada detalhe pensado para a sua tranquilidade absoluta. Descubra espaços únicos.
            </p>
          </motion.div>
        </div>

        {/* Grid Brutalista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 p-px border border-white/10">
          {estruturaItems.map((item, index) => {
            const Icon = iconMap[item.icone];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group w-full relative h-full bg-[#0A161E] hover:bg-[#071118] transition-colors duration-500"
              >
                <div className="absolute inset-0 noise-bg opacity-10 pointer-events-none mix-blend-overlay"></div>
                <article className="relative h-full overflow-hidden flex flex-col">
                  {/* Media Section: Sharp Cut */}
                  <div className="relative aspect-video lg:aspect-4/3 w-full border-b border-white/10 group-hover:border-white/20 transition-colors">
                    <MediaSlider media={item.media} alt={item.titulo} />

                    {/* Minimalist Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest text-white/90 border border-white/10">
                      Ambiente
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center border border-white/20 bg-white/5 text-secondary group-hover:bg-secondary group-hover:text-[#050A0F] group-hover:border-secondary transition-all duration-300">
                        {Icon ? <Icon className="h-5 w-5" strokeWidth={1.5} /> : null}
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-white group-hover:text-secondary transition-colors duration-300 uppercase tracking-wide">
                        {item.titulo}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60 group-hover:text-white/80 transition-colors duration-300">
                      {item.descricao}
                    </p>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
