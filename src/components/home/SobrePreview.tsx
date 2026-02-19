'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, MapPin } from 'lucide-react';
import Button from '@/components/ui/app-button';
import EssenceMark from '@/components/icons/EssenceMark';

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

  const IMAGE_DURATION = 3000;
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
      className="relative h-full w-full overflow-hidden bg-dark touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
            />
          );
        }

        return (
          <div
            key={`sobre-i-${item.url}-${i}`}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
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

      {hasMultiple && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
          {resolvedMedia.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Mídia ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === safeActiveIndex
                  ? 'w-4 bg-white/95'
                  : 'w-1.5 bg-white/55 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SobrePreview({ imageUrl, media = [] }: SobrePreviewProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-4/3">
              <SobreMediaSlider media={media} fallbackImageUrl={imageUrl} />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-secondary text-dark p-6 rounded-2xl shadow-xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-dark/10 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8" fill="currentColor" />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold">10</p>
                  <p className="text-sm font-medium opacity-80">Quartos aconchegantes</p>
                </div>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/20 rounded-2xl -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-primary font-medium">
              <EssenceMark className="w-5 h-5" />
              <span>Sobre a Pousada</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Bem-vindo ao <span className="text-primary">Recanto do Matuto</span>
            </h2>

            <p className="text-text-light text-lg leading-relaxed">
              Somos uma pousada nova, construída com carinho e atenção aos detalhes para
              oferecer a você uma experiência única no coração do sertão alagoano. Localizada
              em Piranhas, a poucos minutos do Canyon do Xingó, combinamos conforto moderno
              com a autêntica hospitalidade nordestina.
            </p>

            <div className="space-y-4 pt-4">
              {[
                {
                  icon: <Heart className="w-5 h-5" />,
                  title: 'Hospitalidade Nordestina',
                  desc: 'Atendimento acolhedor como se você estivesse em casa',
                },
                {
                  icon: <MapPin className="w-5 h-5" />,
                  title: 'Localização Privilegiada',
                  desc: 'A poucos minutos do Canyon do Xingó e do Rio São Francisco',
                },
                {
                  icon: <EssenceMark className="w-5 h-5" />,
                  title: 'Estrutura Completa',
                  desc: 'Piscina, área de redes, churrasqueira e muito mais',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">{item.title}</h4>
                    <p className="text-text-light text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/sobre">
                <Button variant="outline" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Conheça nossa história
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
