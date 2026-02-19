'use client';

import { useState, useRef, useEffect } from 'react';
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

  const SWIPE_THRESHOLD = 50;
  const DIRECTION_LOCK_THRESHOLD = 8;
  const IMAGE_AUTOPLAY_MS = 3500;
  const VIDEO_AUTOPLAY_MS = 8000;

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

  const activeIndex = currentIndex >= images.length ? 0 : currentIndex;

  useEffect(() => {
    if (images.length === 0) return;

    videoRefs.current.forEach((videoEl, index) => {
      if (index === activeIndex) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    });
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    if (lightbox || isDragging) return;

    const currentMedia = images[activeIndex];
    const delay = currentMedia?.type === 'video' ? VIDEO_AUTOPLAY_MS : IMAGE_AUTOPLAY_MS;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [activeIndex, images, isDragging, lightbox]);

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
        setDragX(0);
        return;
      }
      // Horizontal — capture and handle swipe
      directionLocked.current = 'horizontal';
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    }

    if (directionLocked.current !== 'horizontal') return;
    setDragX(deltaX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!gestureActive.current) return;
    gestureActive.current = false;
    setIsDragging(false);

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    // Tap: no movement at all + quick touch
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5 && Date.now() - startTime.current < 250) {
      setDragX(0);
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
    setDragX(0);
  };

  const handlePointerCancel = () => {
    gestureActive.current = false;
    setIsDragging(false);
    setDragX(0);
  };

  const offset = -(activeIndex * 100) + dragX / 3.5;

  return (
    <section className="relative overflow-hidden bg-dark py-20 dark-dots">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Momentos no <span className="text-secondary">Recanto</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Confira alguns registros da nossa pousada e da beleza natural da região do Xingó.
          </p>
        </motion.div>

        {/* Counter */}
        <div className="text-center mb-6">
          <span className="text-white/80 text-lg font-medium tabular-nums">
            {activeIndex + 1}
          </span>
          <span className="text-white/25 text-lg font-medium">
            {' '}/ {images.length}
          </span>
        </div>

        {/* Card Deck Viewport */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl select-none"
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
              style={{
                width: `${images.length * 100}%`,
                transform: `translateX(${offset / images.length}%)`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="relative h-full overflow-hidden"
                  style={{ width: `${100 / images.length}%` }}
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
                      style={{
                        transform: i === activeIndex
                          ? `scale(${isDragging ? 1.02 : 1})`
                          : 'scale(1.05)',
                        transition: 'transform 0.5s ease, filter 0.5s ease',
                        filter: i === activeIndex ? 'brightness(1)' : 'brightness(0.5)',
                      }}
                    />
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 384px"
                      draggable={false}
                      className="object-cover"
                      style={{
                        transform: i === activeIndex
                          ? `scale(${isDragging ? 1.02 : 1})`
                          : 'scale(1.05)',
                        transition: 'transform 0.5s ease, filter 0.5s ease',
                        filter: i === activeIndex ? 'brightness(1)' : 'brightness(0.5)',
                      }}
                    />
                  )}

                  {/* Vignette */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)',
                    }}
                  />

                </div>
              ))}
            </div>

            {/* Tap hint */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
              <span
                className="text-white/50 text-xs tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
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
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
              style={{ background: 'rgba(255,255,255,0.08)' }}
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
