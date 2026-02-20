'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-dark/5 -z-10" />
        <motion.div
          className="absolute top-5 left-0 h-1 bg-primary -z-10"
          initial={{ width: '0%' }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={step} className="flex flex-col items-center relative">
              {/* Box */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  'w-10 h-10 rounded-none flex items-center justify-center font-bold transition-all duration-300 border-2',
                  isCompleted && 'bg-primary border-primary text-white',
                  isCurrent && 'bg-dark border-dark text-white',
                  !isCompleted && !isCurrent && 'bg-white text-dark/40 border-dark/10'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'mt-3 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap',
                  isCurrent ? 'text-dark' : 'text-dark/40'
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
