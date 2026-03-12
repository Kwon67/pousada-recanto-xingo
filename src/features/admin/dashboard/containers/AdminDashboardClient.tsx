'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Bell,
  AlertTriangle,
  Phone,
  BedDouble,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserRound,
  Smartphone,
  Monitor,
  Globe,
  PlusCircle,
  ImagePlus,
  FileText,
  Cog,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  formatPaymentStatus,
  formatPhone,
  formatStatus,
} from '@/lib/formatters';
import { getReservaPaidAmount } from '@/lib/payment';
import type { Reserva } from '@/types/reserva';
import type { Quarto } from '@/types/quarto';
import type { AdminAccessLog, AdminAccessEventType } from '@/types/admin';

interface Estatisticas {
  totalReservas: number;
  reservasPendentes: number;
  receitaMes: number;
  taxaOcupacao: number;
}

interface StatsCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  trendValue: string;
  trendLabel: string;
  trendUp: boolean;
}

interface Props {
  estatisticas: Estatisticas;
  reservas: Reserva[];
  quartos: Quarto[];
  acessosAdmin: AdminAccessLog[];
}

type RoomAvailabilityStatus = 'ocupado' | 'pendente' | 'disponivel' | 'inativo';

interface RoomStatusItem {
  quarto: Quarto;
  status: RoomAvailabilityStatus;
  reservaAtiva?: Reserva;
}

const STATUS_PRIORITY: Record<RoomAvailabilityStatus, number> = {
  ocupado: 0,
  pendente: 1,
  disponivel: 2,
  inativo: 3,
};

const RESERVA_CLASSIFICATION_PRIORITY: Record<string, number> = {
  confirmada: 3,
  aguardando_pagamento: 2,
  pendente: 1,
  concluida: 1,
  cancelada: 0,
};

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toISODatePart(value: string): string {
  return value.slice(0, 10);
}

function getDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return 'Dispositivo não identificado';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'Mobile';
  }
  return 'Desktop';
}

function getEventLabel(eventType: AdminAccessEventType): string {
  if (eventType === 'login') return 'Login';
  if (eventType === 'access') return 'Acesso';
  if (eventType === 'logout') return 'Logout';
  return 'Falha de login';
}

function getEventTone(eventType: AdminAccessEventType): string {
  if (eventType === 'login') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  if (eventType === 'access') return 'border-white/10 bg-white/5 text-white/60';
  if (eventType === 'logout') return 'border-white/10 bg-white/5 text-white/40';
  return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
}

export default function AdminDashboardClient({
  estatisticas,
  reservas,
  quartos,
  acessosAdmin,
}: Props) {
  const router = useRouter();
  const pendentes = useMemo(() => reservas.filter((r) => r.status === 'pendente'), [reservas]);
  const aguardandoPagamento = useMemo(
    () => reservas.filter((r) => r.status === 'aguardando_pagamento'),
    [reservas]
  );
  const confirmadas = useMemo(() => reservas.filter((r) => r.status === 'confirmada'), [reservas]);
  const pagamentosAprovados = useMemo(
    () => reservas.filter((r) => r.stripe_payment_status === 'pago'),
    [reservas]
  );
  const pagamentosPendentes = useMemo(
    () =>
      reservas.filter(
        (r) =>
          (r.status === 'pendente' || r.status === 'aguardando_pagamento') &&
          (r.stripe_payment_status === 'pendente' ||
            r.stripe_payment_status === 'falhou' ||
            r.stripe_payment_status === 'nao_iniciado' ||
            !r.stripe_payment_status)
      ),
    [reservas]
  );
  const reservasConfirmadasSemDebito = useMemo(
    () => reservas.filter((r) => r.status === 'confirmada' && r.stripe_payment_status !== 'pago'),
    [reservas]
  );
  const ultimoPagamentoAprovado = useMemo(() => {
    if (pagamentosAprovados.length === 0) return null;

    return [...pagamentosAprovados].sort((a, b) => {
      const aDate = a.payment_approved_at || a.created_at;
      const bDate = b.payment_approved_at || b.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })[0];
  }, [pagamentosAprovados]);
  const todayISO = useMemo(() => formatDateISO(new Date()), []);
  const quickActions = useMemo(
    () => [
      {
        href: '/admin/reservas',
        label: 'Nova reserva manual',
        helper: 'Criar atendimento rápido',
        icon: PlusCircle,
      },
      {
        href: '/admin/quartos',
        label: 'Gerenciar quartos',
        helper: 'Atualizar preço e disponibilidade',
        icon: Cog,
      },
      {
        href: '/admin/galeria',
        label: 'Atualizar galeria',
        helper: 'Subir fotos e organizar destaque',
        icon: ImagePlus,
      },
      {
        href: '/admin/conteudo',
        label: 'Editar conteúdo',
        helper: 'Ajustar textos e chamadas do site',
        icon: FileText,
      },
    ],
    []
  );
  const dashboardDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      }).format(new Date()),
    []
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 30000);

    const onFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [router]);

  const stats: StatsCard[] = useMemo(() => [
    {
      label: 'Receita Total',
      value: formatCurrency(estatisticas.receitaMes),
      icon: <DollarSign className="w-5 h-5" />,
      iconColor: 'text-white',
      iconBg: 'bg-emerald-500',
      trendValue: '20.1%',
      trendLabel: 'vs mês passado',
      trendUp: true,
    },
    {
      label: 'Reservas Ativas',
      value: estatisticas.totalReservas,
      icon: <Users className="w-5 h-5" />,
      iconColor: 'text-white',
      iconBg: 'bg-orange-500',
      trendValue: '15.3%',
      trendLabel: 'vs mês passado',
      trendUp: true,
    },
    {
      label: 'Taxa de Ocupação',
      value: `${estatisticas.taxaOcupacao}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      iconColor: 'text-white',
      iconBg: 'bg-blue-500',
      trendValue: '8.7%',
      trendLabel: 'vs mês passado',
      trendUp: true,
    },
    {
      label: 'Pendentes',
      value: pagamentosPendentes.length,
      icon: <Clock className="w-5 h-5" />,
      iconColor: 'text-white',
      iconBg: 'bg-rose-500',
      trendValue: `${estatisticas.reservasPendentes}`,
      trendLabel: 'aguardando ação',
      trendUp: false,
    },
  ], [estatisticas, pagamentosPendentes]);

  const proximosCheckins = useMemo(() => confirmadas.slice(0, 4), [confirmadas]);
  const recentReservas = useMemo(() => reservas.slice(0, 6), [reservas]);
  const acessosRecentes = useMemo(() => acessosAdmin.slice(0, 8), [acessosAdmin]);
  const ultimoAcesso = acessosRecentes[0] ?? null;
  const falhasRecentes = useMemo(
    () => acessosAdmin.filter((acesso) => acesso.event_type === 'login_failed').length,
    [acessosAdmin]
  );
  const reservasAtivasHoje = useMemo(
    () =>
      reservas.filter((reserva) => {
        if (
          reserva.status !== 'confirmada' &&
          reserva.status !== 'pendente' &&
          reserva.status !== 'aguardando_pagamento'
        ) return false;
        const checkIn = toISODatePart(reserva.check_in);
        const checkOut = toISODatePart(reserva.check_out);
        return checkIn <= todayISO && checkOut > todayISO;
      }),
    [reservas, todayISO]
  );

  const reservaAtivaPorQuarto = useMemo(() => {
    const map = new Map<string, Reserva>();

    for (const reserva of reservasAtivasHoje) {
      const atual = map.get(reserva.quarto_id);
      const prioridadeAtual = atual ? RESERVA_CLASSIFICATION_PRIORITY[atual.status] ?? -1 : -1;
      const prioridadeNova = RESERVA_CLASSIFICATION_PRIORITY[reserva.status] ?? -1;
      const mustReplace =
        !atual ||
        prioridadeNova > prioridadeAtual ||
        (prioridadeNova === prioridadeAtual &&
          toISODatePart(reserva.check_out) > toISODatePart(atual.check_out));

      if (mustReplace) {
        map.set(reserva.quarto_id, reserva);
      }
    }

    return map;
  }, [reservasAtivasHoje]);

  const quartosComStatus = useMemo<RoomStatusItem[]>(
    () =>
      quartos
        .map((quarto) => {
          if (!quarto.ativo) {
            return { quarto, status: 'inativo' as const };
          }

          const reservaAtiva = reservaAtivaPorQuarto.get(quarto.id);
          if (reservaAtiva) {
            if (
              reservaAtiva.status === 'pendente' ||
              reservaAtiva.status === 'aguardando_pagamento'
            ) {
              return { quarto, status: 'pendente' as const, reservaAtiva };
            }
            return { quarto, status: 'ocupado' as const, reservaAtiva };
          }

          return { quarto, status: 'disponivel' as const };
        })
        .sort(
          (a, b) =>
            STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
            a.quarto.ordem - b.quarto.ordem
        ),
    [quartos, reservaAtivaPorQuarto]
  );

  const resumoQuartos = useMemo(
    () =>
      quartosComStatus.reduce(
        (acc, item) => {
          if (item.status === 'ocupado') acc.ocupados += 1;
          if (item.status === 'pendente') acc.pendentes += 1;
          if (item.status === 'disponivel') acc.disponiveis += 1;
          if (item.status === 'inativo') acc.inativos += 1;
          return acc;
        },
        { ocupados: 0, pendentes: 0, disponiveis: 0, inativos: 0 }
      ),
    [quartosComStatus]
  );

  const statusColors: Record<string, string> = {
    pendente: 'border border-amber-500/30 bg-amber-500/10 text-amber-400',
    confirmada: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    cancelada: 'border border-rose-500/30 bg-rose-500/10 text-rose-400',
    concluida: 'border border-white/10 bg-white/5 text-white/60',
    aguardando_pagamento: 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  };
  const paymentStatusColors: Record<string, string> = {
    nao_iniciado: 'border border-white/10 bg-white/5 text-white/50',
    pendente: 'border border-amber-500/30 bg-amber-500/10 text-amber-400',
    pago: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    falhou: 'border border-rose-500/30 bg-rose-500/10 text-rose-400',
    cancelado: 'border border-rose-500/30 bg-rose-500/10 text-rose-400',
    expirado: 'border border-orange-500/30 bg-orange-500/10 text-orange-400',
    reembolsado: 'border border-white/10 bg-white/5 text-white/60',
  };

  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-blue-500" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white uppercase">Dashboard</h1>
            <p className="mt-1 text-sm text-white/40">
              Visão geral da pousada • {dashboardDateLabel}
            </p>
          </div>
        </div>
      </motion.div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link
              href={action.href}
              className="group block rounded-2xl border border-white/8 bg-[#1e293b] px-4 py-4 shadow-sm transition-all hover:border-blue-500/30 hover:bg-[#253449] hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-blue-400">
                  <action.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white/90">{action.label}</p>
              <p className="mt-1 text-xs text-white/40">{action.helper}</p>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Pending Reservations Notification Banner */}
      <AnimatePresence>
        {pendentes.length > 0 && (
          <motion.a
            href="/admin/reservas"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="group block cursor-pointer rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm transition-all hover:border-amber-500/30 hover:bg-amber-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                  <Bell className="w-6 h-6 text-amber-400" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500 text-[10px] font-semibold text-white">
                  {pendentes.length}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-white/90">
                  {pendentes.length} {pendentes.length === 1 ? 'reserva pendente' : 'reservas pendentes'} aguardando confirmação
                </p>
                <p className="mt-0.5 text-sm text-white/50">
                  Clique aqui para revisar e aprovar as reservas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <ArrowRight className="w-5 h-5 text-white/30 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pendentes.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-xl border border-amber-500/10 bg-[#1e293b] px-3 py-2 text-sm">
                  <p className="truncate font-medium text-white/80">{r.hospede?.nome}</p>
                  <p className="text-xs text-white/40">{r.quarto?.nome} · {formatDate(r.check_in)}</p>
                </div>
              ))}
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ultimoPagamentoAprovado && (
          <motion.a
            href="/admin/reservas"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="group block cursor-pointer rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-white/90">
                  Pagamento confirmado
                </p>
                <p className="mt-0.5 text-sm text-white/60">
                  {ultimoPagamentoAprovado.hospede?.nome || 'Hóspede'} •{' '}
                  {ultimoPagamentoAprovado.quarto?.nome || 'Quarto'} •{' '}
                  {formatCurrency(getReservaPaidAmount(ultimoPagamentoAprovado))}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  {ultimoPagamentoAprovado.payment_approved_at
                    ? `Aprovado em ${formatDate(ultimoPagamentoAprovado.payment_approved_at, 'dd/MM/yyyy HH:mm')}`
                    : 'Aprovação recebida'}
                  {' • '}
                  Método: {formatPaymentMethod(ultimoPagamentoAprovado.stripe_payment_method)}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reservasConfirmadasSemDebito.length > 0 && (
          <motion.a
            href="/admin/reservas"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="group block cursor-pointer rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-sm transition-all hover:border-rose-500/30 hover:bg-rose-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-white/90">
                  {reservasConfirmadasSemDebito.length}{' '}
                  {reservasConfirmadasSemDebito.length === 1
                    ? 'reserva confirmada sem débito'
                    : 'reservas confirmadas sem débito'}
                </p>
                <p className="mt-0.5 text-sm text-white/50">
                  Revise o pagamento antes de considerar o valor como recebido.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 transition-transform group-hover:translate-x-1" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reservasConfirmadasSemDebito.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-rose-500/10 bg-[#1e293b] px-3 py-2 text-sm"
                >
                  <p className="truncate font-medium text-white/80">{r.hospede?.nome}</p>
                  <p className="text-xs text-white/40">
                    {r.quarto?.nome} • {formatPaymentStatus(r.stripe_payment_status)}
                  </p>
                </div>
              ))}
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Stats Cards — TailPanel Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-white/8 bg-[#1e293b] p-5 shadow-sm transition-all hover:border-white/12 hover:bg-[#253449]"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-white/50 font-medium">{stat.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconBg} shadow-lg`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <div className="mt-3 flex items-center gap-1.5">
              {stat.trendUp ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              )}
              <span className={`text-sm font-semibold ${stat.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.trendValue}
              </span>
              <span className="text-xs text-white/30">{stat.trendLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/8 bg-[#1e293b] p-6 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Auditoria de Acesso Admin
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Autoatualiza a cada 30 segundos e quando a aba volta ao foco.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50">
              {acessosRecentes.length} registro(s)
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
              {falhasRecentes} falha(s) recentes
            </span>
          </div>
        </div>

        {ultimoAcesso ? (
          <div className="mt-4 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/40">Última atividade registrada</p>
            <p className="mt-1 text-sm text-white/80">
              <span className="font-semibold">{ultimoAcesso.username}</span>
              {' • '}
              {getEventLabel(ultimoAcesso.event_type)}
              {' • '}
              {formatDate(ultimoAcesso.created_at, 'dd/MM/yyyy HH:mm')}
            </p>
            <p className="mt-1 truncate text-xs text-white/40">
              {ultimoAcesso.ip ? `IP: ${ultimoAcesso.ip}` : 'IP não identificado'}
              {ultimoAcesso.path ? ` • Rota: ${ultimoAcesso.path}` : ''}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/40">Nenhuma atividade registrada ainda.</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {acessosRecentes.map((acesso) => {
            const isMobile = getDeviceLabel(acesso.user_agent) === 'Mobile';
            return (
              <div
                key={acesso.id}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                    <UserRound className="w-4 h-4 text-white/40" />
                    {acesso.username}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium border ${getEventTone(acesso.event_type)}`}>
                      {getEventLabel(acesso.event_type)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-white/50">
                      {isMobile ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5" />
                      )}
                      {getDeviceLabel(acesso.user_agent)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {formatDate(acesso.created_at, 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/30">
                  <Globe className="w-3.5 h-3.5" />
                  {acesso.ip || 'IP não identificado'}
                  {acesso.path ? ` • ${acesso.path}` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/8 bg-[#1e293b] p-6 shadow-sm"
        >
          <h2 className="mb-6 font-semibold text-white">Resumo de Reservas</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: 'Pagamentos recebidos', count: pagamentosAprovados.length, color: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
              { label: 'Pendentes', count: pendentes.length, color: 'border border-amber-500/30 bg-amber-500/10 text-amber-400' },
              { label: 'Aguard. pagamento', count: aguardandoPagamento.length, color: 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-400' },
              { label: 'Confirmadas', count: confirmadas.length, color: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
              { label: 'Concluídas', count: reservas.filter(r => r.status === 'concluida').length, color: 'border border-white/10 bg-white/5 text-white/60' },
              { label: 'Canceladas', count: reservas.filter(r => r.status === 'cancelada').length, color: 'border border-rose-500/30 bg-rose-500/10 text-rose-400' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-center">
                <p className="text-2xl font-semibold text-white">{item.count}</p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.color}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/8 bg-[#1e293b] p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-white">Próximos Check-ins</h2>
          <div className="space-y-4">
            {proximosCheckins.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">
                Nenhum check-in próximo
              </p>
            ) : (
              proximosCheckins.map((reserva) => (
                <div key={reserva.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 transition-colors hover:bg-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white/80">
                      {reserva.hospede?.nome}
                    </p>
                    <p className="text-xs text-white/40">
                      {formatDate(reserva.check_in)} · {reserva.quarto?.nome}
                    </p>
                    {reserva.hospede?.telefone && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-white/30">
                        <Phone className="w-3 h-3" />
                        {formatPhone(reserva.hospede.telefone)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="overflow-hidden rounded-2xl border border-white/8 bg-[#1e293b] shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-white/8 p-6">
          <h2 className="font-semibold text-white">Reservas Recentes</h2>
          <a
            href="/admin/reservas"
            className="flex items-center gap-1 text-sm font-medium text-white/40 hover:text-blue-400"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-white/40">Hóspede</th>
                <th className="hidden px-6 py-3 text-left font-medium text-white/40 lg:table-cell">Telefone</th>
                <th className="hidden px-6 py-3 text-left font-medium text-white/40 sm:table-cell">Quarto</th>
                <th className="hidden px-6 py-3 text-left font-medium text-white/40 md:table-cell">Check-in</th>
                <th className="hidden px-6 py-3 text-left font-medium text-white/40 md:table-cell">Hóspedes</th>
                <th className="px-6 py-3 text-left font-medium text-white/40">Valor</th>
                <th className="hidden px-6 py-3 text-left font-medium text-white/40 md:table-cell">Pagamento</th>
                <th className="px-6 py-3 text-left font-medium text-white/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentReservas.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white/80">{r.hospede?.nome}</p>
                    <p className="text-xs text-white/30">{r.hospede?.email}</p>
                  </td>
                  <td className="hidden px-6 py-4 text-white/50 lg:table-cell">
                    {r.hospede?.telefone ? formatPhone(r.hospede.telefone) : '-'}
                  </td>
                  <td className="hidden px-6 py-4 text-white/50 sm:table-cell">{r.quarto?.nome}</td>
                  <td className="hidden px-6 py-4 text-white/50 md:table-cell">{formatDate(r.check_in)}</td>
                  <td className="hidden px-6 py-4 text-white/50 md:table-cell">{r.num_hospedes}</td>
                  <td className="px-6 py-4 font-medium text-white/80">{formatCurrency(r.valor_total)}</td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        paymentStatusColors[r.stripe_payment_status || 'nao_iniciado'] ||
                        paymentStatusColors.nao_iniciado
                      }`}
                    >
                      {formatPaymentStatus(r.stripe_payment_status)}
                    </span>
                    {r.stripe_payment_status === 'pago' ? (
                      <p className="mt-1 text-[11px] text-emerald-400">
                        Sinal recebido: {formatCurrency(getReservaPaidAmount(r))}
                        {r.payment_approved_at
                          ? ` em ${formatDate(r.payment_approved_at, 'dd/MM HH:mm')}`
                          : ''}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-white/30">
                        {formatPaymentMethod(r.stripe_payment_method)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[r.status]}`}>
                      {formatStatus(r.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Room Availability Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-white/8 bg-[#1e293b] p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white">Disponibilidade de Hoje</h2>
            <p className="mt-1 text-xs text-white/40">
              Leitura em tempo real baseada nas reservas ativas e quartos inativos
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {quartosComStatus.length} quartos monitorados
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Ocupados</p>
            <p className="mt-1 text-2xl font-semibold text-white">{resumoQuartos.ocupados}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-white" />
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Pendentes</p>
            <p className="mt-1 text-2xl font-semibold text-white">{resumoQuartos.pendentes}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-amber-500" />
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Disponíveis</p>
            <p className="mt-1 text-2xl font-semibold text-white">{resumoQuartos.disponiveis}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-emerald-500" />
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Inativos</p>
            <p className="mt-1 text-2xl font-semibold text-white">{resumoQuartos.inativos}</p>
            <div className="mt-3 h-1.5 w-10 rounded-full bg-white/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {quartosComStatus.map((item) => {
            const ocupado = item.status === 'ocupado';
            const pendente = item.status === 'pendente';
            const disponivel = item.status === 'disponivel';

            const cardClass = ocupado
              ? 'border-white/12 bg-white/[0.05]'
              : pendente
                ? 'border-amber-500/20 bg-amber-500/5'
                : disponivel
                  ? 'border-emerald-500/15 bg-emerald-500/5'
                  : 'border-white/8 bg-white/[0.02]';

            const badgeClass = ocupado
              ? 'border border-white/20 bg-white/10 text-white'
              : pendente
                ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                : disponivel
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border border-white/10 bg-white/5 text-white/40';

            return (
              <div
                key={item.quarto.id}
                className={`rounded-2xl border p-4 transition-all hover:bg-white/[0.04] ${cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/80">
                      {item.quarto.nome}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {ocupado
                        ? 'Com hóspede em estadia hoje'
                        : pendente
                          ? 'Reserva aguardando confirmação'
                          : disponivel
                            ? 'Sem conflito de reserva para hoje'
                            : 'Quarto desativado no painel'}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClass}`}>
                    {ocupado ? (
                      <BedDouble className="w-3.5 h-3.5" />
                    ) : pendente ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : disponivel ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {ocupado ? 'Ocupado' : pendente ? 'Pendente' : disponivel ? 'Livre' : 'Inativo'}
                  </span>
                </div>

                {(ocupado || pendente) && item.reservaAtiva ? (
                  <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                    <p className="truncate text-xs text-white/50">
                      Hóspede <span className="font-medium text-white/70">{item.reservaAtiva.hospede?.nome || 'Não informado'}</span>
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      {pendente
                        ? `Confirmação pendente para ${formatDate(item.reservaAtiva.check_in)}`
                        : `Saída prevista: ${formatDate(item.reservaAtiva.check_out)}`}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-white/30">
                    {disponivel
                      ? 'Sem conflito de reserva para hoje.'
                      : 'Quarto desativado manualmente no painel.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
