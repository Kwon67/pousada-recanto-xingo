'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Home, MessageCircle, Calendar, MapPin, Users, Moon, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';
import { getReservaById } from '@/lib/actions/reservas';

interface ReservaDetalhes {
  id: string;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  status: string;
  quarto?: { nome: string; imagem_principal: string | null } | null;
  hospede?: { nome: string; email: string; telefone: string | null } | null;
}

function ConfirmacaoContent() {
  const searchParams = useSearchParams();
  const reservaId = searchParams.get('id') || 'RES-XXXXX';
  const [reserva, setReserva] = useState<ReservaDetalhes | null>(null);

  useEffect(() => {
    if (reservaId && reservaId !== 'RES-XXXXX') {
      getReservaById(reservaId).then((data) => {
        if (data) setReserva(data as ReservaDetalhes);
      });
    }
  }, [reservaId]);

  const whatsappMessage = `Olá! Acabei de fazer uma reserva pelo site (${reservaId}). Gostaria de confirmar os detalhes.`;

  const formatarData = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const calcularNoites = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn + 'T00:00:00');
    const end = new Date(checkOut + 'T00:00:00');
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen noise-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
            >
              <CheckCircle className="w-12 h-12 text-success" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl md:text-4xl font-bold text-dark mb-4"
          >
            Reserva Confirmada!
          </motion.h1>

          {/* Reservation ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full mb-6"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Código: {reservaId}</span>
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-text-light text-lg mb-8 max-w-md mx-auto"
          >
            Obrigado por escolher o Recanto do Matuto! Entraremos em contato via WhatsApp
            para confirmar os detalhes da sua reserva.
          </motion.p>

          {/* Reservation Details Card */}
          {reserva && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-6 mb-6 text-left"
            >
              <h2 className="font-display text-lg font-semibold text-dark mb-4">
                Detalhes da Reserva
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {reserva.quarto && (
                  <div className="col-span-2 flex items-center gap-2 text-text-light">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-dark">{reserva.quarto.nome}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-text-light">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-text-light/70 block">Check-in</span>
                    <span className="font-medium text-dark">{formatarData(reserva.check_in)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-text-light/70 block">Check-out</span>
                    <span className="font-medium text-dark">{formatarData(reserva.check_out)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-text-light/70 block">Hóspedes</span>
                    <span className="font-medium text-dark">{reserva.num_hospedes}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Moon className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-text-light/70 block">Noites</span>
                    <span className="font-medium text-dark">{calcularNoites(reserva.check_in, reserva.check_out)}</span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 pt-3 border-t border-dark/10">
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-text-light/70 block">Valor Total</span>
                    <span className="font-semibold text-primary text-lg">
                      {reserva.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg shadow-dark/5 p-6 mb-8"
          >
            <h2 className="font-display text-lg font-semibold text-dark mb-4">
              Próximos passos
            </h2>
            <ul className="text-left space-y-3">
              {[
                'Você receberá um email com os detalhes da reserva',
                'Entraremos em contato pelo WhatsApp para confirmar',
                'O pagamento será combinado diretamente com a pousada',
                'Guarde o código da reserva para referência',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-text-light">
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={getWhatsAppLink(SITE_CONFIG.phoneClean, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                leftIcon={<MessageCircle className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Falar no WhatsApp
              </Button>
            </a>
            <Link href="/">
              <Button
                variant="outline"
                leftIcon={<Home className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Voltar para o início
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-20 bg-cream min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-light">Carregando...</div>
      </div>
    }>
      <ConfirmacaoContent />
    </Suspense>
  );
}
