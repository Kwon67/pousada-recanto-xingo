'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loading() {
  const logoUrl = 'https://res.cloudinary.com/diuh0ditl/image/upload/v1771538229/recantodomatuto_keg3sl.png';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1B3A4B] overflow-hidden">
      {/* Background Liquid Shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -left-1/4 w-full h-full bg-primary/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-secondary/10 rounded-full blur-[120px]"
      />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
        {/* Massive Typographic Reveal */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <h2 className="text-[25vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
            XINGÓ
          </h2>
        </div>

        {/* Logo with Magnetic Morph Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'brightness(0) invert(1)' }}
          animate={{ opacity: 1, scale: 1, filter: 'brightness(1) invert(0)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-48 h-48 sm:w-64 sm:h-64"
        >
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          <Image
            src={logoUrl}
            alt="Loading..."
            fill
            priority
            className="object-contain drop-shadow-[0_0_40px_rgba(212,168,67,0.3)]"
          />
        </motion.div>

        {/* Asymmetric Loading Text */}
        <div className="mt-12 flex flex-col items-start gap-1">
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-medium"
            >
              Arquitetando
            </motion.p>
          </div>
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-secondary text-sm font-light italic"
            >
              seu refúgio perfeito...
            </motion.p>
          </div>
        </div>

        {/* Modern Minimalist Line */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/10">
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-secondary"
          />
        </div>
      </div>
    </div>
  );
}



