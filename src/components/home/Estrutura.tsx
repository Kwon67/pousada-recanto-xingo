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
    <section className="relative overflow-hidden bg-dark py-24 dark-dots">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            Estrutura Premium
          </span>
          <h2 className="mt-5 mb-4 font-display text-3xl font-bold text-white md:text-5xl">
            Tudo que você precisa para <span className="text-secondary">relaxar</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/75">
            Nossa pousada oferece uma estrutura completa para que você aproveite cada momento da
            sua estadia com conforto e tranquilidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {estruturaItems.map((item, index) => {
            const Icon = iconMap[item.icone];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.52, delay: index * 0.08 }}
                className="group"
              >
                <article className="relative h-full overflow-hidden rounded-[28px] border border-white/15 bg-white/6 shadow-[0_12px_42px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/55 hover:shadow-[0_20px_54px_rgba(0,0,0,0.38)]">
                  <MediaSlider media={item.media} alt={item.titulo} />

                  {/* Badge + Icon — positioned over media */}
                  <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/25 px-3 py-1 text-[11px] font-medium tracking-wide text-white/85 backdrop-blur">
                    Ambiente
                  </div>

                  <div className="absolute bottom-[calc(100%-13rem+1rem)] left-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/90 text-dark shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur">
                    <div className="absolute inset-[3px] rounded-lg border border-dark/12" />
                    <div className="relative transition-transform duration-300 group-hover:scale-110">
                      {Icon ? <Icon className="h-6 w-6" strokeWidth={2} /> : null}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-secondary">
                      {item.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">{item.descricao}</p>
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
