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
    <div className="bg-white rounded-none border border-dark/10 p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Month 1 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-none border border-transparent hover:border-dark/10 hover:bg-cream transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-dark" />
            </button>
            <span className="font-display font-black text-dark uppercase tracking-widest text-sm">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-none border border-transparent hover:border-dark/10 hover:bg-cream transition-colors lg:hidden"
            >
              <ChevronRight className="w-5 h-5 text-dark" />
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
                    'w-full aspect-square rounded-none text-sm font-bold transition-all duration-200 relative',
                    'hover:bg-dark/5 focus:outline-none focus:ring-2 focus:ring-dark/20',
                    disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent line-through font-normal',
                    (isCheckIn || isCheckOut) && 'bg-dark text-white hover:bg-black',
                    inRange && !isCheckIn && !isCheckOut && 'bg-dark/5',
                    today && !isCheckIn && !isCheckOut && 'ring-2 ring-dark/20',
                    !isCheckIn && !isCheckOut && !disabled && !inRange && 'text-dark/80'
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
            <span className="font-display font-black text-dark uppercase tracking-widest text-sm">
              {format(addMonths(currentMonth, 1), 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-none border border-transparent hover:border-dark/10 hover:bg-cream transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-dark" />
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
                        'w-full aspect-square rounded-none text-sm font-bold transition-all duration-200 relative',
                        'hover:bg-dark/5 focus:outline-none focus:ring-2 focus:ring-dark/20',
                        disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent line-through font-normal',
                        (isCheckIn || isCheckOut) && 'bg-dark text-white hover:bg-black',
                        inRange && !isCheckIn && !isCheckOut && 'bg-dark/5',
                        today && !isCheckIn && !isCheckOut && 'ring-2 ring-dark/20',
                        !isCheckIn && !isCheckOut && !disabled && !inRange && 'text-dark/80'
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
      <div className="mt-6 pt-6 border-t border-dark/10 flex flex-wrap gap-6 text-xs uppercase tracking-widest font-bold">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-none bg-dark" />
          <span className="text-dark/60">Check-in / out</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-none bg-dark/10" />
          <span className="text-dark/60">Selecionado</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-none border border-dark/20 bg-cream line-through flex items-center justify-center text-[10px] text-dark/40">
            x
          </div>
          <span className="text-dark/40">Indisponível</span>
        </div>
      </div>

      {/* Selection Info */}
      {(checkIn || checkOut) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-cream border border-dark/10 rounded-none"
        >
          <p className="text-xs uppercase tracking-widest font-bold text-dark/60">
            {selectingCheckOut
              ? 'Agora selecione a data de check-out'
              : 'Clique em uma data para começar uma nova seleção'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
