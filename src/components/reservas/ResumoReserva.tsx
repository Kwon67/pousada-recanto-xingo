'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, User, Mail, Phone, FileText } from 'lucide-react';
import { Quarto } from '@/types/quarto';
import { NovoHospede } from '@/types/hospede';
import { formatCurrency, formatDateLong, formatNights, formatGuests } from '@/lib/formatters';
import Button from '@/components/ui/app-button';

interface ResumoReservaProps {
  quarto: Quarto;
  checkIn: Date;
  checkOut: Date;
  numHospedes: number;
  hospede: NovoHospede;
  observacoes?: string;
  valorTotal: number;
  noites: number;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function ResumoReserva({
  quarto,
  checkIn,
  checkOut,
  numHospedes,
  hospede,
  observacoes,
  valorTotal,
  noites,
  onConfirm,
  onBack,
  isLoading,
}: ResumoReservaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-none border border-dark/10 overflow-hidden"
    >
      {/* Quarto Header */}
      <div className="relative h-48 md:h-64">
        <Image
          src={quarto.imagem_principal}
          alt={quarto.nome}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-md">
            {quarto.nome}
          </h2>
          <p className="text-white/70 text-sm mt-1">{quarto.descricao_curta}</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Reservation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Dates */}
          <div className="space-y-6">
            <h3 className="font-display text-sm font-black uppercase tracking-widest text-dark border-b border-dark/10 pb-4">
              Detalhes da Reserva
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Check-in</p>
                  <p className="font-bold text-dark">{formatDateLong(checkIn)}</p>
                  <p className="text-xs text-dark/60">A partir das 14h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Check-out</p>
                  <p className="font-bold text-dark">{formatDateLong(checkOut)}</p>
                  <p className="text-xs text-dark/60">Até às 12h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Hóspedes</p>
                  <p className="font-bold text-dark">{formatGuests(numHospedes)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="space-y-6">
            <h3 className="font-display text-sm font-black uppercase tracking-widest text-dark border-b border-dark/10 pb-4">
              Dados do Hóspede
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Nome</p>
                  <p className="font-bold text-dark">{hospede.nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Email</p>
                  <p className="font-bold text-dark">{hospede.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Telefone</p>
                  <p className="font-bold text-dark">{hospede.telefone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cream border border-dark/10 rounded-none flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Cidade</p>
                  <p className="font-bold text-dark">{hospede.cidade}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observations */}
        {observacoes && (
          <div className="mb-10 p-6 bg-cream border border-dark/10 rounded-none">
            <div className="flex items-start gap-4">
              <FileText className="w-5 h-5 text-dark shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-dark/40">Observações</p>
                <p className="text-dark font-medium">{observacoes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-dark text-white rounded-none p-8 mb-10">
          <h3 className="font-display text-sm font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
            Resumo do Valor
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-white/70 font-medium">
              <span>{formatNights(noites)}</span>
              <span>{formatCurrency(valorTotal)}</span>
            </div>
            <div className="border-t border-white/20 pt-4 flex justify-between items-end">
              <span className="font-bold text-sm tracking-widest uppercase text-white/70">Total</span>
              <span className="font-display text-4xl font-black text-secondary">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-white/50 mt-6 tracking-widest uppercase">
            * Você será redirecionado para o Stripe para pagar com cartão, Pix e demais métodos.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="sm:flex-1 rounded-none border-2 border-dark/20 uppercase tracking-widest text-xs font-bold text-dark hover:bg-dark hover:text-white transition-colors">
            Voltar
          </Button>
          <Button onClick={onConfirm} className="sm:flex-1 rounded-none uppercase tracking-widest text-xs font-bold border-2 border-dark bg-dark text-white hover:bg-white hover:text-dark transition-colors" loading={isLoading}>
            Ir para pagamento
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
