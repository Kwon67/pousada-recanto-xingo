'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LightboxImage {
  id: string;
  url: string;
  alt: string;
  type: 'image' | 'video';
}

interface GaleriaProps {
  images: LightboxImage[];
}

const TRACK_TRANSITION = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
const MEDIA_TRANSITION = 'transform 0.5s ease, filter 0.5s ease';
const VIGNETTE_STYLE = {
  background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)',
} as const;
const TAP_HINT_STYLE = {
  background: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(8px)',
} as const;
const LIGHTBOX_STYLE = {
  background: 'rgba(0,0,0,0.92)',
  backdropFilter: 'blur(20px)',
} as const;
const LIGHTBOX_CLOSE_STYLE = {
  background: 'rgba(255,255,255,0.08)',
} as const;

export default function Galeria({ images }: GaleriaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const gestureActive = useRef(false);
  const directionLocked = useRef<'horizontal' | 'vertical' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const dragRafRef = useRef<number | null>(null);
  const pendingDragRef = useRef(0);

  const SWIPE_THRESHOLD = 50;
  const DIRECTION_LOCK_THRESHOLD = 8;
  const IMAGE_AUTOPLAY_MS = 3500;
  const VIDEO_AUTOPLAY_MS = 8000;
  const scheduleDragX = useCallback((value: number) => {
    pendingDragRef.current = value;
    if (dragRafRef.current !== null) {
      return;
    }
    dragRafRef.current = requestAnimationFrame(() => {
      setDragX(pendingDragRef.current);
      dragRafRef.current = null;
    });
  }, []);

  const commitDragX = useCallback((value: number) => {
    if (dragRafRef.current !== null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    pendingDragRef.current = value;
    setDragX(value);
  }, []);

  useEffect(() => {
    return () => {
      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  const imageCount = images.length;
  const activeIndex = imageCount === 0 ? 0 : (currentIndex >= imageCount ? 0 : currentIndex);
  const currentMediaType = images[activeIndex]?.type;
  const offset = -(activeIndex * 100) + dragX / 3.5;
  const trackStyle = useMemo(
    () => ({
      width: `${imageCount * 100}%`,
      transform: `translateX(${offset / Math.max(imageCount, 1)}%)`,
      transition: isDragging ? 'none' : TRACK_TRANSITION,
      willChange: 'transform' as const,
    }),
    [imageCount, offset, isDragging]
  );
  const slideStyle = useMemo(
    () => ({
      width: `${100 / Math.max(imageCount, 1)}%`,
    }),
    [imageCount]
  );
  const activeMediaStyle = useMemo(
    () => ({
      transform: `scale(${isDragging ? 1.02 : 1})`,
      transition: MEDIA_TRANSITION,
      filter: 'brightness(1)',
      willChange: 'transform',
    }),
    [isDragging]
  );
  const inactiveMediaStyle = useMemo(
    () => ({
      transform: 'scale(1.05)',
      transition: MEDIA_TRANSITION,
      filter: 'brightness(0.5)',
      willChange: 'transform',
    }),
    []
  );

  useEffect(() => {
    if (imageCount === 0) return;

    videoRefs.current.forEach((videoEl, index) => {
      if (index === activeIndex) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    });
  }, [activeIndex, imageCount]);

  useEffect(() => {
    if (imageCount <= 1 || lightbox || isDragging) return;

    const delay = currentMediaType === 'video' ? VIDEO_AUTOPLAY_MS : IMAGE_AUTOPLAY_MS;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % imageCount);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [currentMediaType, imageCount, isDragging, lightbox]);

  if (images.length === 0) {
    return null;
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
    directionLocked.current = null;
    gestureActive.current = true;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gestureActive.current) return;

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    // Determine direction on first significant movement
    if (!directionLocked.current) {
      if (Math.abs(deltaX) < DIRECTION_LOCK_THRESHOLD && Math.abs(deltaY) < DIRECTION_LOCK_THRESHOLD) {
        return;
      }
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical — abort gesture entirely, let browser scroll
        directionLocked.current = 'vertical';
        gestureActive.current = false;
        setIsDragging(false);
        commitDragX(0);
        return;
      }
      // Horizontal — capture and handle swipe
      directionLocked.current = 'horizontal';
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    }

    if (directionLocked.current !== 'horizontal') return;
    scheduleDragX(deltaX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!gestureActive.current) return;
    gestureActive.current = false;
    setIsDragging(false);

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    // Tap: no movement at all + quick touch
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5 && Date.now() - startTime.current < 250) {
      commitDragX(0);
      setLightbox(images[activeIndex]);
      return;
    }

    // Horizontal swipe
    if (directionLocked.current === 'horizontal') {
      if (deltaX < -SWIPE_THRESHOLD && activeIndex < images.length - 1) {
        setCurrentIndex(activeIndex + 1);
      } else if (deltaX > SWIPE_THRESHOLD && activeIndex > 0) {
        setCurrentIndex(activeIndex - 1);
      }
    }
    commitDragX(0);
  };

  const handlePointerCancel = () => {
    gestureActive.current = false;
    setIsDragging(false);
    commitDragX(0);
  };

  return (
    <section className="relative overflow-hidden bg-[#0A161E] py-24 lg:py-32">
      {/* Background noise */}
      <div className="absolute inset-0 noise-bg opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Brutalist Section Header */}
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
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Galeria</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Momentos<br />
              <span className="italic text-secondary/90 font-medium">No Recanto.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:text-right flex flex-col items-start md:items-end justify-end"
          >
             {/* Counter moved to header for integration */}
            <div className="text-right mb-4">
              <span className="text-white text-3xl font-display font-medium tabular-nums">
                {(activeIndex + 1).toString().padStart(2, '0')}
              </span>
              <span className="text-white/30 text-xl font-display font-medium">
                {' '}/ {images.length.toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-white/60 text-lg max-w-sm md:ml-auto">
              Confira alguns registros da nossa pousada e da beleza natural da região do Xingó.
            </p>
          </motion.div>
        </div>

        {/* Card Deck Viewport */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative w-full max-w-sm overflow-hidden select-none border border-white/10"
            style={{
              aspectRatio: '3/4',
              touchAction: 'pan-y',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {/* Sliding track */}
            <div
              className="absolute top-0 left-0 h-full flex"
              style={trackStyle}
            >
              {images.map((img, i) => {
                const isActive = i === activeIndex;

                return (
                  <div
                    key={img.id}
                    className="relative h-full overflow-hidden"
                    style={slideStyle}
                  >
                    {img.type === 'video' ? (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current.set(i, el);
                          else videoRefs.current.delete(i);
                        }}
                        src={img.url}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                        style={isActive ? activeMediaStyle : inactiveMediaStyle}
                      />
                    ) : (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, 384px"
                        draggable={false}
                        className="object-cover"
                        style={isActive ? activeMediaStyle : inactiveMediaStyle}
                      />
                    )}

                    {/* Vignette */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={VIGNETTE_STYLE}
                    />
                  </div>
                );
              })}
            </div>

            {/* Tap hint */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
              <span
                className="text-white/50 text-xs tracking-widest uppercase px-3 py-1 rounded-full"
                style={TAP_HINT_STYLE}
              >
                toque para ampliar
              </span>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="rounded-full transition-all duration-300 ease-out"
              style={{
                width: i === activeIndex ? '28px' : '8px',
                height: '8px',
                background: i === activeIndex
                  ? 'rgba(212,168,67,0.9)'
                  : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={LIGHTBOX_STYLE}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
              style={LIGHTBOX_CLOSE_STYLE}
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {lightbox.type === 'video' ? (
              <motion.video
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                src={lightbox.url}
                controls
                autoPlay
                playsInline
                className="max-w-[92vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <motion.img
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                src={lightbox.url}
                alt={lightbox.alt}
                className="max-w-[92vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white font-medium">{lightbox.alt}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
