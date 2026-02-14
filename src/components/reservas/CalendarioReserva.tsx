'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
  isWithinInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarioReservaProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onSelectDates: (checkIn: Date, checkOut: Date) => void;
  disabledDates?: Date[];
  minDate?: Date;
}

export default function CalendarioReserva({
  checkIn,
  checkOut,
  onSelectDates,
  disabledDates = [],
  minDate = new Date(),
}: CalendarioReservaProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = startOfMonth(currentMonth).getDay();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const isDisabled = (date: Date) => {
    if (isBefore(date, startOfDay(minDate))) return true;
    return disabledDates.some((d) => isSameDay(d, date));
  };

  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return isWithinInterval(date, { start: checkIn, end: checkOut });
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;

    if (!selectingCheckOut) {
      // Selecting check-in
      onSelectDates(date, checkOut && date < checkOut ? checkOut : date);
      setSelectingCheckOut(true);
    } else {
      // Selecting check-out
      if (checkIn && date <= checkIn) {
        // If clicked date is before check-in, restart selection
        onSelectDates(date, date);
        setSelectingCheckOut(true);
      } else {
        onSelectDates(checkIn!, date);
        setSelectingCheckOut(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Month 1 */}
        <div className="flex-1">
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
              className="p-2 rounded-lg hover:bg-cream-dark transition-colors lg:hidden"
            >
              <ChevronRight className="w-5 h-5 text-text" />
            </button>
            <div className="hidden lg:block w-10" />
          </div>

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

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const disabled = isDisabled(day);
              const isCheckIn = checkIn && isSameDay(day, checkIn);
              const isCheckOut = checkOut && isSameDay(day, checkOut);
              const inRange = isInRange(day);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={disabled}
                  className={cn(
                    'w-full aspect-square rounded-lg text-sm font-medium transition-all duration-200 relative',
                    'hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30',
                    disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent line-through',
                    (isCheckIn || isCheckOut) && 'bg-primary text-white hover:bg-primary-dark',
                    inRange && !isCheckIn && !isCheckOut && 'bg-primary/10',
                    today && !isCheckIn && !isCheckOut && 'ring-2 ring-primary/30',
                    !isCheckIn && !isCheckOut && !disabled && !inRange && 'text-text'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Month 2 (Desktop) */}
        <div className="flex-1 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10" />
            <span className="font-display font-semibold text-dark capitalize">
              {format(addMonths(currentMonth, 1), 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-cream-dark transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-text" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={`m2-${day}`}
                className="text-center text-xs font-medium text-text-light py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {(() => {
            const nextMonth = addMonths(currentMonth, 1);
            const nextMonthDays = eachDayOfInterval({
              start: startOfMonth(nextMonth),
              end: endOfMonth(nextMonth),
            });
            const nextStartDay = startOfMonth(nextMonth).getDay();

            return (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: nextStartDay }).map((_, i) => (
                  <div key={`empty-m2-${i}`} />
                ))}
                {nextMonthDays.map((day) => {
                  const disabled = isDisabled(day);
                  const isCheckIn = checkIn && isSameDay(day, checkIn);
                  const isCheckOut = checkOut && isSameDay(day, checkOut);
                  const inRange = isInRange(day);
                  const today = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleDateClick(day)}
                      disabled={disabled}
                      className={cn(
                        'w-full aspect-square rounded-lg text-sm font-medium transition-all duration-200 relative',
                        'hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30',
                        disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent line-through',
                        (isCheckIn || isCheckOut) && 'bg-primary text-white hover:bg-primary-dark',
                        inRange && !isCheckIn && !isCheckOut && 'bg-primary/10',
                        today && !isCheckIn && !isCheckOut && 'ring-2 ring-primary/30',
                        !isCheckIn && !isCheckOut && !disabled && !inRange && 'text-text'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-cream-dark flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary" />
          <span className="text-text-light">Check-in / Check-out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/10" />
          <span className="text-text-light">Período selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cream-dark line-through flex items-center justify-center text-xs opacity-50">
            X
          </div>
          <span className="text-text-light">Indisponível</span>
        </div>
      </div>

      {/* Selection Info */}
      {(checkIn || checkOut) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-cream rounded-xl"
        >
          <p className="text-sm text-text-light">
            {selectingCheckOut
              ? 'Agora selecione a data de check-out'
              : 'Clique em uma data para começar uma nova seleção'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
