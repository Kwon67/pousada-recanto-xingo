'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = startOfMonth(currentMonth).getDay();

  const isDisabled = (date: Date) => {
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isBefore(maxDate, date)) return true;
    return disabledDates.some((d) => isSameDay(d, date));
  };

  const handleSelect = (date: Date) => {
    if (!isDisabled(date)) {
      onChange(date);
      setIsOpen(false);
    }
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border-2 border-cream-dark bg-white text-left flex items-center gap-3 transition-all duration-200',
          'hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          error && 'border-error focus:border-error focus:ring-error/20',
          isOpen && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <Calendar className="w-5 h-5 text-text-light" />
        <span className={cn('flex-1', !value && 'text-text-light/60')}>
          {value ? format(value, "dd 'de' MMM, yyyy", { locale: ptBR }) : 'Selecione uma data'}
        </span>
      </button>

      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl shadow-dark/10 z-50 w-full min-w-[300px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-cream-dark transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-text" />
                </button>
                <span className="font-display font-semibold text-dark capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-cream-dark transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-text" />
                </button>
              </div>

              {/* Week days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-text-light py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const disabled = isDisabled(day);
                  const selected = value && isSameDay(day, value);
                  const today = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleSelect(day)}
                      disabled={disabled}
                      className={cn(
                        'w-full aspect-square rounded-lg text-sm font-medium transition-all duration-200',
                        'hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30',
                        disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                        selected && 'bg-primary text-white hover:bg-primary-dark',
                        today && !selected && 'ring-2 ring-primary/30',
                        !selected && !disabled && 'text-text'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
