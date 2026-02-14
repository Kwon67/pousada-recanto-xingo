'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-cream z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-primary" />
            </div>
          </div>
        </motion.div>
        <p className="text-text-light font-medium">Carregando...</p>
      </div>
    </div>
  );
}
