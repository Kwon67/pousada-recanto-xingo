'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, User, Mail, Phone, FileText } from 'lucide-react';
import { Quarto } from '@/types/quarto';
import { NovoHospede } from '@/types/hospede';
import { formatCurrency, formatDateLong, formatNights, formatGuests } from '@/lib/formatters';
import Button from '@/components/ui/Button';

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
      className="bg-white rounded-2xl shadow-lg shadow-dark/5 overflow-hidden"
    >
      {/* Quarto Header */}
      <div className="relative h-48 md:h-64">
        <img
          src={quarto.imagem_principal}
          alt={quarto.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="font-display text-2xl font-bold text-white">
            {quarto.nome}
          </h2>
          <p className="text-white/70 text-sm mt-1">{quarto.descricao_curta}</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Reservation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-dark">
              Detalhes da Reserva
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Check-in</p>
                  <p className="font-medium text-dark">{formatDateLong(checkIn)}</p>
                  <p className="text-xs text-text-light">A partir das 14h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Check-out</p>
                  <p className="font-medium text-dark">{formatDateLong(checkOut)}</p>
                  <p className="text-xs text-text-light">Até às 12h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Hóspedes</p>
                  <p className="font-medium text-dark">{formatGuests(numHospedes)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-dark">
              Dados do Hóspede
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-secondary-dark" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Nome</p>
                  <p className="font-medium text-dark">{hospede.nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-secondary-dark" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Email</p>
                  <p className="font-medium text-dark">{hospede.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-secondary-dark" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Telefone</p>
                  <p className="font-medium text-dark">{hospede.telefone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-secondary-dark" />
                </div>
                <div>
                  <p className="text-sm text-text-light">Cidade</p>
                  <p className="font-medium text-dark">{hospede.cidade}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observations */}
        {observacoes && (
          <div className="mb-8 p-4 bg-cream rounded-xl">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-text-light">Observações</p>
                <p className="text-dark">{observacoes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-cream rounded-xl p-6 mb-8">
          <h3 className="font-display text-lg font-semibold text-dark mb-4">
            Resumo do Valor
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-text-light">
              <span>{formatNights(noites)}</span>
              <span>{formatCurrency(valorTotal)}</span>
            </div>
            <div className="border-t border-cream-dark pt-3 flex justify-between">
              <span className="font-semibold text-dark">Total</span>
              <span className="font-display text-2xl font-bold text-primary">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
          <p className="text-xs text-text-light mt-4">
            * O pagamento será combinado diretamente com a pousada via WhatsApp
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="sm:flex-1">
            Voltar
          </Button>
          <Button onClick={onConfirm} className="sm:flex-1" loading={isLoading}>
            Confirmar Reserva
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
