'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock3,
  CreditCard,
  Home,
  MapPin,
  MessageCircle,
  Moon,
  Users,
  XCircle,
} from 'lucide-react';
import Button from '@/components/ui/app-button';
import { SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';
import { getReservaById } from '@/lib/actions/reservas';
import { formatDate, formatPaymentMethod, formatPaymentStatus } from '@/lib/formatters';
import type { StatusPagamentoReserva } from '@/types/reserva';

interface ReservaDetalhes {
  id: string;
  check_in: string;
  check_out: string;
  num_hospedes: number;
  valor_total: number;
  status: string;
  stripe_payment_status?: StatusPagamentoReserva;
  stripe_payment_method?: string | null;
  payment_approved_at?: string | null;
  quarto?: { nome: string; imagem_principal: string | null } | null;
  hospede?: { nome: string; email: string; telefone: string | null } | null;
}

function calcularNoites(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
}

function getStatusUI(status: StatusPagamentoReserva | 'cancelado_query') {
  switch (status) {
    case 'pago':
      return {
        title: 'Pagamento aprovado!',
        message:
          'Recebemos seu pagamento no Stripe e sua reserva já está confirmada. Você também receberá um e-mail com os detalhes.',
        icon: CheckCircle,
        circleClass: 'bg-success/10',
        iconClass: 'text-success',
      };
    case 'falhou':
      return {
        title: 'Pagamento não aprovado',
        message:
          'O Stripe informou falha no pagamento. Você pode tentar novamente usando outro método de pagamento.',
        icon: XCircle,
        circleClass: 'bg-error/10',
        iconClass: 'text-error',
      };
    case 'expirado':
      return {
        title: 'Sessão de pagamento expirada',
        message:
          'A sessão de checkout expirou. Faça uma nova tentativa de reserva para gerar um novo link de pagamento.',
        icon: Clock3,
        circleClass: 'bg-warning/10',
        iconClass: 'text-warning',
      };
    case 'cancelado':
    case 'cancelado_query':
      return {
        title: 'Pagamento cancelado',
        message:
          'O pagamento foi cancelado antes da confirmação. Se quiser, você pode refazer a reserva para gerar um novo checkout.',
        icon: AlertCircle,
        circleClass: 'bg-warning/10',
        iconClass: 'text-warning',
      };
    case 'nao_iniciado':
    case 'pendente':
    default:
      return {
        title: 'Aguardando confirmação do pagamento',
        message:
          'Estamos aguardando a confirmação do Stripe. Em pagamentos Pix isso pode levar alguns minutos.',
        icon: Clock3,
        circleClass: 'bg-warning/10',
        iconClass: 'text-warning',
      };
  }
}

function ConfirmacaoContent() {
  const searchParams = useSearchParams();
  const reservaId = searchParams.get('id') || 'RES-XXXXX';
  const paymentQuery = searchParams.get('payment');
  const [reserva, setReserva] = useState<ReservaDetalhes | null>(null);

  useEffect(() => {
    if (reservaId && reservaId !== 'RES-XXXXX') {
      getReservaById(reservaId).then((data) => {
        if (data) setReserva(data as ReservaDetalhes);
      });
    }
  }, [reservaId]);

  const whatsappMessage = `Olá! Gostaria de ajuda com a reserva ${reservaId}.`;

  const paymentStatus = useMemo<StatusPagamentoReserva | 'cancelado_query'>(() => {
    if (paymentQuery === 'cancelado') return 'cancelado_query';
    return reserva?.stripe_payment_status || 'pendente';
  }, [paymentQuery, reserva?.stripe_payment_status]);

  const statusUI = getStatusUI(paymentStatus);
  const Icon = statusUI.icon;

  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen noise-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-24 h-24 ${statusUI.circleClass} rounded-full flex items-center justify-center mx-auto mb-8`}
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}>
              <Icon className={`w-12 h-12 ${statusUI.iconClass}`} />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl md:text-4xl font-bold text-dark mb-4"
          >
            {statusUI.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full mb-6"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Código: {reservaId}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-text-light text-lg mb-8 max-w-md mx-auto"
          >
            {statusUI.message}
          </motion.p>

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
                    <span className="font-medium text-dark">{formatDate(reserva.check_in)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-text-light/70 block">Check-out</span>
                    <span className="font-medium text-dark">{formatDate(reserva.check_out)}</span>
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
                      {reserva.valor_total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 bg-cream rounded-xl p-4">
                  <p className="text-xs text-text-light/70 mb-1">Status do pagamento</p>
                  <p className="font-semibold text-dark">
                    {formatPaymentStatus(reserva.stripe_payment_status || paymentStatus)}
                  </p>
                  <p className="text-sm text-text-light mt-1">
                    Método: {formatPaymentMethod(reserva.stripe_payment_method)}
                  </p>
                  {reserva.payment_approved_at && (
                    <p className="text-sm text-text-light mt-1">
                      Aprovado em: {formatDate(reserva.payment_approved_at, 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

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
                'Acompanhe o status da sua reserva pelo código informado',
                'Você receberá e-mail quando o pagamento for confirmado',
                'Em caso de dúvida, fale com a pousada pelo WhatsApp',
                'Guarde este comprovante para referência',
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-text-light">
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

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
            <Link href="/reservas">
              <Button variant="outline" className="w-full sm:w-auto">
                Fazer nova reserva
              </Button>
            </Link>
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
    <Suspense
      fallback={
        <div className="pt-24 pb-20 bg-cream min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-text-light">Carregando...</div>
        </div>
      }
    >
      <ConfirmacaoContent />
    </Suspense>
  );
}
