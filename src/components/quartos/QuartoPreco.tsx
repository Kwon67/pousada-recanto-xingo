'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, MessageCircle } from 'lucide-react';
import { addDays } from 'date-fns';
import { Quarto } from '@/types/quarto';
import { formatCurrency } from '@/lib/formatters';
import { calcularValorTotal, calcularNoites, getWhatsAppLink } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/constants';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/app-button';

interface QuartoPrecoProps {
  quarto: Quarto;
}

const guestsOptions = [
  { value: 1, label: '1 hóspede' },
  { value: 2, label: '2 hóspedes' },
  { value: 3, label: '3 hóspedes' },
  { value: 4, label: '4 hóspedes' },
];

export default function QuartoPreco({ quarto }: QuartoPrecoProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState('2');

  const today = new Date();
  const noites = checkIn && checkOut ? calcularNoites(checkIn, checkOut) : 0;
  const valorTotal =
    checkIn && checkOut
      ? calcularValorTotal(checkIn, checkOut, quarto.preco_diaria, quarto.preco_fds)
      : 0;

  const handleReservar = () => {
    const params = new URLSearchParams({
      quarto: quarto.id,
      checkIn: checkIn?.toISOString() || '',
      checkOut: checkOut?.toISOString() || '',
      guests,
    });
    window.location.href = `/reservas?${params.toString()}`;
  };

  const whatsappMessage = `Olá! Gostaria de reservar o ${quarto.nome}${
    checkIn && checkOut
      ? ` para ${noites} noite(s)`
      : ''
  }. Podem me ajudar?`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="sticky top-24"
    >
      <div className="bg-white rounded-none border-2 border-dark/10 p-6">
        {/* Price Header */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-black tracking-tighter text-dark">
              {formatCurrency(quarto.preco_diaria)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark/40">/noite</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-dark/40 mt-1">
            Finais de semana: {formatCurrency(quarto.preco_fds)}/noite
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <DatePicker
            label="Check-in"
            value={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              if (checkOut && date >= checkOut) {
                setCheckOut(addDays(date, 1));
              }
            }}
            minDate={today}
          />

          <DatePicker
            label="Check-out"
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
          />

          <Select
            label="Hóspedes"
            options={guestsOptions.filter((g) => g.value <= quarto.capacidade)}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>

        {/* Calculation */}
        {noites > 0 && (
          <div className="mb-6 p-4 bg-cream rounded-none space-y-2 border border-dark/10">
            <div className="flex justify-between text-sm">
              <span className="text-text-light">
                {formatCurrency(quarto.preco_diaria)} x {noites} noite(s)
              </span>
              <span className="text-text">{formatCurrency(valorTotal)}</span>
            </div>
            <div className="flex justify-between font-black uppercase tracking-widest text-xs pt-2 border-t border-dark/10">
              <span className="text-dark">Total</span>
              <span className="text-dark text-lg md:text-xl tracking-tighter">{formatCurrency(valorTotal)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleReservar}
            fullWidth
            size="lg"
            disabled={!checkIn || !checkOut}
          >
            Reservar agora
          </Button>

          <a
            href={getWhatsAppLink(SITE_CONFIG.phoneClean, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 text-primary hover:text-primary-dark transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            ou chame no WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
